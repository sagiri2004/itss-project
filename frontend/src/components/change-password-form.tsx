"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"
import api from "@/services/api"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function ChangePasswordForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [mode, setMode] = useState<'change' | 'forgot'>('change')
  // Forgot password states
  const [forgotStep, setForgotStep] = useState<1 | 2>(1)
  const [forgotData, setForgotData] = useState({
    username: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [forgotErrors, setForgotErrors] = useState({
    username: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
      valid = false
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
      valid = false
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
      valid = false
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
      valid = false
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await api.auth.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.response?.data?.message || "There was an error updating your password.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Forgot password handlers
  const handleForgotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForgotData((prev) => ({ ...prev, [name]: value }))
    if (forgotErrors[name as keyof typeof forgotErrors]) {
      setForgotErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForgotStep1 = () => {
    let valid = true
    const newErrors = { username: '', email: '', code: '', newPassword: '', confirmPassword: '' }
    if (!forgotData.username) {
      newErrors.username = 'Username is required'
      valid = false
    }
    if (!forgotData.email) {
      newErrors.email = 'Email is required'
      valid = false
    }
    setForgotErrors(newErrors)
    return valid
  }
  const validateForgotStep2 = () => {
    let valid = true
    const newErrors = { username: '', email: '', code: '', newPassword: '', confirmPassword: '' }
    if (!forgotData.code) {
      newErrors.code = 'Verification code is required'
      valid = false
    }
    if (!forgotData.newPassword) {
      newErrors.newPassword = 'New password is required'
      valid = false
    } else if (forgotData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
      valid = false
    }
    if (!forgotData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
      valid = false
    } else if (forgotData.newPassword !== forgotData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      valid = false
    }
    setForgotErrors(newErrors)
    return valid
  }

  const handleForgotSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForgotStep1()) return
    setForgotLoading(true)
    try {
      await api.auth.forgotPassword({ username: forgotData.username, email: forgotData.email })
      toast({
        title: 'Verification code sent',
        description: 'A reset code has been sent to your email.'
      })
      setForgotStep(2)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Could not send reset code.'
      if (error.response?.status === 400) {
        // Hiển thị lỗi validation
        if (errorMessage.includes('tài khoản')) {
          setForgotErrors(prev => ({ ...prev, username: 'Tài khoản không tồn tại' }))
        } else if (errorMessage.includes('Email')) {
          setForgotErrors(prev => ({ ...prev, email: 'Email không khớp với tài khoản' }))
        }
        toast({
          variant: 'destructive',
          title: 'Thông tin không hợp lệ',
          description: errorMessage
        })
      } else {
        // Hiển thị lỗi hệ thống
        toast({
          variant: 'destructive',
          title: 'Lỗi hệ thống',
          description: 'Không thể gửi mã xác thực. Vui lòng thử lại sau.'
        })
      }
    } finally {
      setForgotLoading(false)
    }
  }

  const handleForgotSubmitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForgotStep2()) return
    setForgotLoading(true)
    try {
      await api.auth.resetPassword({
        username: forgotData.username,
        code: forgotData.code,
        newPassword: forgotData.newPassword,
      })
      toast({
        title: 'Password reset',
        description: 'Your password has been reset successfully.'
      })
      setForgotStep(1)
      setForgotData({ username: '', email: '', code: '', newPassword: '', confirmPassword: '' })
      setMode('change')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Reset failed',
        description: error.response?.data?.message || 'Could not reset password.'
      })
    } finally {
      setForgotLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

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
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto max-w-md space-y-6 p-4"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Tabs value={mode} onValueChange={v => setMode(v as 'change' | 'forgot')} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="change">Change Password</TabsTrigger>
            <TabsTrigger value="forgot">Forgot Password?</TabsTrigger>
          </TabsList>
          <TabsContent value="change">
            <Card>
              <CardHeader>
                <CardTitle>Update Your Password</CardTitle>
                <CardDescription>Choose a strong password that you don't use for other websites</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="pl-8 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">{showCurrentPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="pl-8 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-8 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                      </Button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-xs text-muted-foreground">
                  After changing your password, you'll be logged out of all devices except this one.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="forgot">
            <Card>
              <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>Enter your username and email to receive a reset code.</CardDescription>
              </CardHeader>
              <CardContent>
                {forgotStep === 1 ? (
                  <form onSubmit={handleForgotSubmitStep1} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-username">Username</Label>
                      <Input
                        id="forgot-username"
                        name="username"
                        value={forgotData.username}
                        onChange={handleForgotInputChange}
                        autoComplete="username"
                      />
                      {forgotErrors.username && <p className="text-xs text-destructive">{forgotErrors.username}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        name="email"
                        type="email"
                        value={forgotData.email}
                        onChange={handleForgotInputChange}
                        autoComplete="email"
                      />
                      {forgotErrors.email && <p className="text-xs text-destructive">{forgotErrors.email}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={forgotLoading}>
                      {forgotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Send Reset Code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleForgotSubmitStep2} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-code">Verification Code</Label>
                      <Input
                        id="forgot-code"
                        name="code"
                        value={forgotData.code}
                        onChange={handleForgotInputChange}
                      />
                      {forgotErrors.code && <p className="text-xs text-destructive">{forgotErrors.code}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="forgot-newPassword">New Password</Label>
                      <Input
                        id="forgot-newPassword"
                        name="newPassword"
                        type="password"
                        value={forgotData.newPassword}
                        onChange={handleForgotInputChange}
                      />
                      {forgotErrors.newPassword && <p className="text-xs text-destructive">{forgotErrors.newPassword}</p>}
                      <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="forgot-confirmPassword">Confirm New Password</Label>
                      <Input
                        id="forgot-confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={forgotData.confirmPassword}
                        onChange={handleForgotInputChange}
                      />
                      {forgotErrors.confirmPassword && <p className="text-xs text-destructive">{forgotErrors.confirmPassword}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={forgotLoading}>
                      {forgotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Reset Password
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                {forgotStep === 2 && (
                  <Button variant="link" size="sm" onClick={() => setForgotStep(1)}>
                    Back to send code
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
