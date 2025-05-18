"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash,
  Calendar,
  Wrench,
  CalendarCheck,
} from "lucide-react";
import api from "@/services/api";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const vehicleTypes = ["Tow Truck", "Flatbed", "Motorbike", "Van", "Other"];
const vehicleStatuses = [
  "AVAILABLE",
  "IN_USE",
  "MAINTENANCE",
  "OUT_OF_SERVICE",
];

interface Vehicle {
  id: string;
  name: string;
  make: string;
  licensePlate: string;
  model: string;
  status: string;
  assignedDriverName?: string;
  equipmentDetails?: string[];
  currentLatitude: number;
  currentLongitude: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export default function CompanyVehicles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    make: "",
    model: "",
    licensePlate: "",
    status: "AVAILABLE",
    assignedDriverName: "",
    lastMaintenanceDate: "",
    nextMaintenanceDate: "",
    currentLatitude: 21.0285,
    currentLongitude: 105.8542,
  });

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      if (!user?.companyId) throw new Error("Company ID is missing");
      const res = await api.rescueVehicles.getCompanyVehicles(user.companyId);
      setVehicles(res.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load vehicles",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, [user]);

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.assignedDriverName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      make: "",
      model: "",
      licensePlate: "",
      status: "AVAILABLE",
      assignedDriverName: "",
      lastMaintenanceDate: "",
      nextMaintenanceDate: "",
      currentLatitude: 21.0285,
      currentLongitude: 105.8542,
    });
    setCurrentVehicle(null);
    setIsEditing(false);
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        make: vehicle.make || "",
        model: vehicle.model || "",
        licensePlate: vehicle.licensePlate || "",
        status: vehicle.status,
        assignedDriverName: vehicle.assignedDriverName || "",
        lastMaintenanceDate: vehicle.lastMaintenanceDate
          ? vehicle.lastMaintenanceDate.slice(0, 10)
          : "",
        nextMaintenanceDate: vehicle.nextMaintenanceDate
          ? vehicle.nextMaintenanceDate.slice(0, 10)
          : "",
        currentLatitude: vehicle.currentLatitude,
        currentLongitude: vehicle.currentLongitude,
      });
      setCurrentVehicle(vehicle);
      setIsEditing(true);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.licensePlate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }
    try {
      const payload = {
        ...formData,
        companyId: user?.companyId,
        lastMaintenanceDate: formData.lastMaintenanceDate
          ? new Date(formData.lastMaintenanceDate)
          : undefined,
        nextMaintenanceDate: formData.nextMaintenanceDate
          ? new Date(formData.nextMaintenanceDate)
          : undefined,
        currentLatitude: formData.currentLatitude,
        currentLongitude: formData.currentLongitude,
      };
      if (isEditing && currentVehicle) {
        await api.rescueVehicles.updateVehicle(currentVehicle.id, payload);
        toast({
          title: "Vehicle updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await api.rescueVehicles.createVehicle(payload);
        toast({
          title: "Vehicle added",
          description: `${formData.name} has been added to your fleet.`,
        });
      }
      fetchVehicles();
      handleCloseDialog();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to save vehicle",
      });
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await api.rescueVehicles.deleteVehicle(id);
      fetchVehicles();
      toast({
        title: "Vehicle removed",
        description: `Vehicle has been removed from your fleet.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete vehicle",
      });
    }
  };

  const markForMaintenance = async (id: string) => {
    try {
      await api.rescueVehicles.updateVehicleStatus(id, "MAINTENANCE");
      fetchVehicles();
      toast({
        title: "Maintenance scheduled",
        description: `Vehicle has been marked for maintenance.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update vehicle status",
      });
    }
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "IN_USE":
        return "default";
      case "MAINTENANCE":
        return "outline";
      case "OUT_OF_SERVICE":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Map marker drag handler
  function LocationMarker() {
    useMapEvents({
      dragend(e) {
        // not used
      },
      click(e) {
        setFormData((prev) => ({
          ...prev,
          currentLatitude: e.latlng.lat,
          currentLongitude: e.latlng.lng,
        }));
      },
    });
    return typeof formData.currentLatitude === "number" &&
      typeof formData.currentLongitude === "number" ? (
      <Marker
        position={[formData.currentLatitude, formData.currentLongitude]}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const { lat, lng } = marker.getLatLng();
            setFormData((prev) => ({
              ...prev,
              currentLatitude: lat,
              currentLongitude: lng,
            }));
          },
        }}
        icon={L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    ) : null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Vehicles</CardTitle>
            <CardDescription>
              Manage your fleet of rescue and service vehicles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search vehicles..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No vehicles found. Try adjusting your search or add a
                        new vehicle.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {vehicle.model}
                          </div>
                        </TableCell>
                        <TableCell>{vehicle.licensePlate}</TableCell>
                        <TableCell>
                          {vehicle.assignedDriverName || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(vehicle.status)}
                          >
                            {vehicle.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>Last: {vehicle.lastMaintenanceDate}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <CalendarCheck className="mr-1 h-3 w-3" />
                            <span>Next: {vehicle.nextMaintenanceDate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => markForMaintenance(vehicle.id)}
                              title="Schedule Maintenance"
                              disabled={vehicle.status === "MAINTENANCE"}
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenDialog(vehicle)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteVehicle(vehicle.id)}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update your vehicle details below."
                  : "Add a new vehicle to your rescue fleet."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Vehicle Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Tow Truck #1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="make">Vehicle Make</Label>
                  <Input
                    id="make"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    placeholder="e.g., Ford"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., F-150"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="ABC-1234"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedDriverName">Assigned Driver</Label>
                  <Input
                    id="assignedDriverName"
                    name="assignedDriverName"
                    value={formData.assignedDriverName}
                    onChange={handleInputChange}
                    placeholder="Driver Name"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastMaintenanceDate">
                  Last Maintenance Date
                </Label>
                <Input
                  id="lastMaintenanceDate"
                  name="lastMaintenanceDate"
                  type="date"
                  value={formData.lastMaintenanceDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nextMaintenanceDate">
                  Next Maintenance Date
                </Label>
                <Input
                  id="nextMaintenanceDate"
                  name="nextMaintenanceDate"
                  type="date"
                  value={formData.nextMaintenanceDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label>Vehicle Location</Label>
                <div className="h-56 w-full rounded-md overflow-hidden">
                  <MapContainer
                    center={[
                      typeof formData.currentLatitude === "number"
                        ? formData.currentLatitude
                        : 0,
                      typeof formData.currentLongitude === "number"
                        ? formData.currentLongitude
                        : 0,
                    ]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker />
                  </MapContainer>
                </div>
                <div className="flex gap-2 text-xs mt-1">
                  <span>Lat: {formData.currentLatitude?.toFixed(5)}</span>
                  <span>Lng: {formData.currentLongitude?.toFixed(5)}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
