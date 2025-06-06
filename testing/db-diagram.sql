Table users {
  id varchar [pk]
  created_at datetime
  email varchar [unique]
  last_login_at datetime
  name varchar
  password varchar
  reset_code varchar
  updated_at datetime
  username varchar [unique]
  role enum('ADMIN', 'COMPANY', 'USER')
}

Table rescue_companies {
  id varchar [pk]
  city varchar
  country varchar
  district varchar
  full_address varchar
  address_latitude double
  address_longitude double
  street varchar
  ward varchar
  created_at datetime
  description varchar
  latitude double
  longitude double
  name varchar
  phone varchar
  user_id varchar [ref: > users.id]
}

Table rescue_services {
  id varchar [pk]
  description varchar
  name varchar
  price double
  type enum('BATTERY_JUMP_START', 'FUEL_DELIVERY', 'LOCKOUT_SERVICE', 'ON_SITE_REPAIR', 'OTHER', 'TIRE_REPAIR', 'TIRE_REPLACEMENT', 'TOWING')
  company_id varchar [ref: > rescue_companies.id]
}

Table rescue_service_deletion_requests {
  id varchar [pk]
  service_id varchar [ref: > rescue_services.id, not null]
  company_id varchar [ref: > rescue_companies.id, not null]
  reason varchar
  status enum('PENDING', 'APPROVED', 'REJECTED') [not null]
  created_at datetime [not null]
  processed_at datetime
}

Table rescue_requests {
  id varchar [pk]
  created_at datetime
  description varchar
  estimated_price double
  final_price double
  latitude double
  longitude double
  notes varchar
  status enum('ACCEPTED_BY_COMPANY', 'CANCELLED_BY_COMPANY', 'CANCELLED_BY_USER', 'COMPLETED', 'CREATED', 'INSPECTION_DONE', 'INVOICED', 'IN_PROGRESS', 'PAID', 'PRICE_CONFIRMED', 'PRICE_UPDATED', 'REJECTED_BY_USER', 'RESCUE_VEHICLE_ARRIVED', 'RESCUE_VEHICLE_DISPATCHED')
  vehicle_color varchar
  vehicle_image_url varchar
  vehicle_license_plate varchar
  vehicle_make varchar
  vehicle_model varchar
  vehicle_year varchar
  company_id varchar [ref: > rescue_companies.id]
  service_id varchar [ref: > rescue_services.id]
  user_id varchar [ref: > users.id]
}

Table rescue_vehicle {
  id varchar [pk]
  assigned_driver_name varchar
  created_at datetime
  current_latitude double
  current_longitude double
  license_plate varchar
  make varchar
  model varchar
  name varchar
  status enum('AVAILABLE', 'ON_DUTY', 'OUT_OF_SERVICE')
  updated_at datetime
  company_id varchar [ref: > rescue_companies.id]
}

Table vehicle_maintenance_logs {
  id varchar [pk]
  vehicle_id varchar [ref: > rescue_vehicle.id, not null]
  maintenance_date datetime
  next_maintenance_date datetime
  maintenance_note varchar 
  maintenance_reason varchar
  created_at datetime [not null]
}

Table vehicle_equipment {
  vehicle_id varchar [ref: > rescue_vehicle.id]
  equipment enum('AIR_COMPRESSOR', 'FIRE_EXTINGUISHER', 'FUEL_CAN', 'JACK', 'JUMPER_CABLES', 'LIGHTING', 'TIRE_REPAIR_KIT', 'TOOL_BOX', 'TOW_CHAIN', 'WINCH')
}

Table rescue_vehicle_dispatch {
  id varchar [pk]
  arrived_at datetime
  completed_at datetime
  dispatch_notes varchar
  dispatched_at datetime
  status enum('ARRIVED', 'CANCELLED', 'COMPLETED', 'DISPATCHED', 'IN_PROGRESS')
  request_id varchar [ref: > rescue_requests.id]
  vehicle_id varchar [ref: > rescue_vehicle.id]
}


Table topic {
  id varchar [pk]
  category varchar
  comment_count int
  content text
  created_at datetime
  image_url varchar
  title varchar
  updated_at datetime
  user_id varchar [ref: > users.id]
  view_count int
}

Table topic_comment {
  id varchar [pk]
  content text
  created_at datetime
  topic_id varchar [ref: > topic.id]
  updated_at datetime
  user_id varchar [ref: > users.id]
}

Table company_ratings {
  id varchar [pk]
  comment varchar
  created_at datetime
  stars int
  updated_at datetime
  company_id varchar [ref: > rescue_companies.id]
  service_id varchar [ref: > rescue_services.id]
  user_id varchar [ref: > users.id]
}

Table comment_reports {
  id varchar [pk]
  created_at datetime
  reason varchar
  resolution_note varchar
  status enum('APPROVED', 'PENDING', 'REJECTED')
  updated_at datetime
  rating_id varchar [ref: > company_ratings.id]
  reporter_id varchar [ref: > users.id]
  resolved_by varchar [ref: > users.id]
}


Table report {
  id varchar [pk]
  created_at datetime
  reason varchar
  reporter_id varchar [ref: > users.id]
  resolution_note varchar
  resolved_by varchar [ref: > users.id]
  status enum('APPROVED', 'PENDING', 'REJECTED')
  target_id varchar
  type enum('COMMENT', 'RESCUE_REQUEST', 'TOPIC')
  updated_at datetime
}

Table keyword {
  id varchar [pk]
  created_at datetime
  severity varchar
  updated_at datetime
  word varchar [unique]
}

Table conversations {
  id varchar [pk]
  created_at datetime
  updated_at datetime
  rescue_company_id varchar [ref: > rescue_companies.id]
  user_id varchar [ref: > users.id]
}

Table messages {
  id varchar [pk]
  content text
  is_read bit
  sender_type enum('RESCUE_COMPANY', 'USER')
  sent_at datetime
  conversation_id varchar [ref: > conversations.id]
}

Table invoices {
  id varchar [pk]
  amount double [not null]
  created_at datetime [not null]
  created_by varchar [ref: > users.id, not null]
  due_date datetime [not null]
  invoice_date datetime [not null]
  invoice_number varchar [unique, not null]
  notes varchar
  paid_date datetime
  payment_method varchar
  status enum('CANCELLED', 'OVERDUE', 'PAID', 'PENDING') [not null]
  rescue_request_id varchar [ref: > rescue_requests.id, not null]
  rescue_company_id varchar [ref: > rescue_companies.id, not null]
  rescue_service_id varchar [ref: > rescue_services.id, not null]
}