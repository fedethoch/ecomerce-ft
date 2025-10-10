"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LogOut,
  Package,
  MapPin,
  Edit,
  Camera,
  Key,
  Trash2,
  Save,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  full_name?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
}

interface Address {
  id: string;
  title: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form states
  const [editForm, setEditForm] = useState<UserProfile>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [addressForm, setAddressForm] = useState({
    title: "",
    street: "",
    city: "",
    postal_code: "",
    country: "",
    is_default: false,
  });

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        setProfile(data.user.user_metadata || {});
        setEditForm(data.user.user_metadata || {});
        // In a real app, you'd fetch addresses from your database
        // setAddresses(await fetchUserAddresses(data.user.id))
      }
      setLoading(false);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          router.push("/login");
        } else {
          setUser(session.user);
          setProfile(session.user.user_metadata || {});
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: editForm,
      });

      if (error) throw error;

      setProfile(editForm);
      setIsEditing(false);
      showNotification("success", "Perfil actualizado correctamente");
    } catch (error: any) {
      showNotification(
        "error",
        error.message || "Error al actualizar el perfil"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification("error", "Las contraseñas no coinciden");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification(
        "error",
        "La contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordDialog(false);
      showNotification("success", "Contraseña actualizada correctamente");
    } catch (error: any) {
      showNotification(
        "error",
        error.message || "Error al cambiar la contraseña"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const supabase = createClient();

      // Upload to Supabase Storage (you'd need to set up a bucket)
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;

      // For now, we'll just use a placeholder URL
      // In a real app, you'd upload to storage and get the URL
      const avatarUrl = `/placeholder.svg?height=96&width=96&query=user avatar ${user.email}`;

      const { error } = await supabase.auth.updateUser({
        data: { ...profile, avatar_url: avatarUrl },
      });

      if (error) throw error;

      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
      showNotification("success", "Foto de perfil actualizada");
    } catch (error: any) {
      showNotification("error", error.message || "Error al subir la imagen");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/");
    } else {
      console.error("Error logging out:", error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {notification && (
          <Alert
            className={
              notification.type === "success"
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }
          >
            {notification.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                notification.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }
            >
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={
                    profile.avatar_url ||
                    "/placeholder.svg?height=96&width=96&query=user profile avatar"
                  }
                  alt="Avatar de usuario"
                />
                <AvatarFallback>
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-4 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={saving}
                />
              </label>
            </div>
            <CardTitle className="text-3xl font-bold">
              {profile.full_name || "Mi Perfil"}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {profile.bio ||
                "Gestiona la información de tu cuenta y tus pedidos."}
            </CardDescription>
            <Badge variant="secondary" className="mt-2">
              Miembro desde {new Date(user.created_at).toLocaleDateString()}
            </Badge>
          </CardHeader>
        </Card>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white  rounded-lg border border-border">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white transition-colors"
            >
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white transition-colors"
            >
              Pedidos
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white transition-colors"
            >
              Direcciones
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-white transition-colors"
            >
              Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información de perfil
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => {
                    if (isEditing) {
                      setEditForm(profile);
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  {isEditing ? (
                    <X className="mr-2 h-4 w-4" />
                  ) : (
                    <Edit className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? "Cancelar" : "Editar"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Nombre Completo</Label>
                    <Input
                      id="full_name"
                      type="text"
                      value={
                        isEditing
                          ? editForm.full_name || ""
                          : profile.full_name || ""
                      }
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={
                        isEditing ? editForm.phone || "" : profile.phone || ""
                      }
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                      placeholder="Ingresa tu teléfono"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={isEditing ? editForm.bio || "" : profile.bio || ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    readOnly={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                    placeholder="Cuéntanos un poco sobre ti..."
                    rows={3}
                  />
                </div>
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleUpdateProfile} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Historial de Pedidos
                </CardTitle>
                <CardDescription>
                  Consulta el estado de tus pedidos anteriores y actuales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Aún no tienes pedidos
                  </p>
                  <p className="mb-4">
                    ¡Explora nuestros productos y realiza tu primera compra!
                  </p>
                  <Button asChild>
                    <Link href="/productos">Ir a Productos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Direcciones de Envío
                  </CardTitle>
                  <CardDescription>
                    Gestiona tus direcciones para un proceso de compra más
                    rápido.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddressDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Dirección
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    No tienes direcciones guardadas
                  </p>
                  <p className="mb-4">
                    Añade una dirección para futuras compras más rápidas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Seguridad de la Cuenta
                </CardTitle>
                <CardDescription>
                  Gestiona la seguridad y privacidad de tu cuenta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Cambiar Contraseña</h3>
                    <p className="text-sm text-muted-foreground">
                      Actualiza tu contraseña regularmente para mayor seguridad
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Cambiar
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                  <div>
                    <h3 className="font-medium text-red-600">
                      Eliminar Cuenta
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-transparent"
                    variant="outline"
                    disabled={loading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Ingresa tu nueva contraseña"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleChangePassword} disabled={saving}>
                {saving ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
