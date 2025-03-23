"use client"

import { useEffect, useState } from "react"
import {
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
  KeyIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  ActivityIcon,
  RefreshCwIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Usuario } from "@/types/usuario"
import type { Licencia } from "@/types/licencia"

export function CardsUsersLicencias() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [licencias, setLicencias] = useState<Licencia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch usuarios
      const usuariosResponse = await fetch("/api/usuarios")
      if (!usuariosResponse.ok) {
        throw new Error("Error al obtener los usuarios")
      }
      const usuariosData = await usuariosResponse.json()
      setUsuarios(usuariosData)

      // Fetch licencias
      const licenciasResponse = await fetch("/api/licencias")
      if (!licenciasResponse.ok) {
        throw new Error("Error al obtener las licencias")
      }
      const licenciasData = await licenciasResponse.json()
      setLicencias(licenciasData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Cálculos para Usuarios
  const totalUsuarios = usuarios.length
  const activeUsuarios = usuarios.filter((u) => Number(u.status) === 1).length
  const inactiveUsuarios = usuarios.filter((u) => Number(u.status) === 0).length
  const activeUsuariosPercentage = totalUsuarios > 0 ? (activeUsuarios / totalUsuarios) * 100 : 0
  const previousTotalUsuarios = totalUsuarios // Reemplázalo con dato real en caso de contar históricos
  const percentageChangeUsuarios = previousTotalUsuarios
    ? (((totalUsuarios - previousTotalUsuarios) / previousTotalUsuarios) * 100).toFixed(1)
    : "0.0"

  // Cálculos para Licencias
  const totalLicencias = licencias.length
  const activeLicencias = licencias.filter((l) => Number(l.status) === 1).length
  const inactiveLicencias = licencias.filter((l) => Number(l.status) === 0).length
  const activeLicenciasPercentage = totalLicencias > 0 ? (activeLicencias / totalLicencias) * 100 : 0
  const previousTotalLicencias = totalLicencias // Reemplázalo con dato real en caso de contar históricos
  const percentageChangeLicencias = previousTotalLicencias
    ? (((totalLicencias - previousTotalLicencias) / previousTotalLicencias) * 100).toFixed(1)
    : "0.0"

  // Cálculos adicionales para detalles
  const licenciasPorUsuario = totalUsuarios > 0 ? (totalLicencias / totalUsuarios).toFixed(2) : "0"
  const usuariosConLicencia = usuarios.filter((u) =>
    licencias.some((l) => l.id === u.id && Number(l.status) === 1),
  ).length
  const usuariosSinLicencia = activeUsuarios - usuariosConLicencia
  const usuariosConLicenciaPercentage = activeUsuarios > 0 ? (usuariosConLicencia / activeUsuarios) * 100 : 0

  // Renderizado de skeleton durante carga
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex justify-between mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex justify-between mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Botón de actualización */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted"
        >
          <RefreshCwIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Actualizando..." : "Actualizar datos"}
        </button>
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Usuarios */}
        <Card className="overflow-hidden border-l-4 border-l-blue-500 dark:border-l-blue-600 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="relative pb-2">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <CardDescription className="text-sm font-medium">Total de usuarios</CardDescription>
            </div>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold tabular-nums">{totalUsuarios.toLocaleString()}</CardTitle>
              <Badge
                variant={Number(percentageChangeUsuarios) >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1 rounded-lg"
              >
                {Number(percentageChangeUsuarios) >= 0 ? (
                  <>
                    <TrendingUpIcon className="w-3.5 h-3.5" />+{percentageChangeUsuarios}%
                  </>
                ) : (
                  <>
                    <TrendingDownIcon className="w-3.5 h-3.5" />
                    {percentageChangeUsuarios}%
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Activos
                  </span>
                  <span className="font-medium">
                    {activeUsuarios.toLocaleString()} ({activeUsuariosPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={activeUsuariosPercentage}
                  className="h-2 bg-green-500 dark:bg-green-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-500">
                    <ShieldXIcon className="w-4 h-4" />
                    Inactivos
                  </span>
                  <span className="font-medium">
                    {inactiveUsuarios.toLocaleString()} ({(100 - activeUsuariosPercentage).toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={100 - activeUsuariosPercentage}
                  className="h-2 bg-red-500 dark:bg-red-600"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4 flex flex-col items-start gap-1">
            <div className="w-full pt-2 border-t border-border">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="general" className="text-xs">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="licencias" className="text-xs">
                    Licencias
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="licencias" className="pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <KeyIcon className="w-4 h-4 text-amber-500" />
                        Con licencia activa
                      </span>
                      <span className="font-medium">
                        {usuariosConLicencia} ({usuariosConLicenciaPercentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={usuariosConLicenciaPercentage} className="h-2 bg-amber-500" />
                    <div className="text-xs text-muted-foreground mt-1">
                      Promedio: {licenciasPorUsuario} licencias por usuario activo
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardFooter>
        </Card>

        {/* Tarjeta de Licencias */}
        <Card className="overflow-hidden border-l-4 border-l-purple-500 dark:border-l-purple-600 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="relative pb-2">
            <div className="flex items-center gap-2">
              <KeyIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              <CardDescription className="text-sm font-medium">Total de licencias</CardDescription>
            </div>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold tabular-nums">{totalLicencias.toLocaleString()}</CardTitle>
              <Badge
                variant={Number(percentageChangeLicencias) >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1 rounded-lg"
              >
                {Number(percentageChangeLicencias) >= 0 ? (
                  <>
                    <TrendingUpIcon className="w-3.5 h-3.5" />+{percentageChangeLicencias}%
                  </>
                ) : (
                  <>
                    <TrendingDownIcon className="w-3.5 h-3.5" />
                    {percentageChangeLicencias}%
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-500">
                    <ActivityIcon className="w-4 h-4" />
                    Activas
                  </span>
                  <span className="font-medium">
                    {activeLicencias.toLocaleString()} ({activeLicenciasPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={activeLicenciasPercentage}
                  className="h-2 bg-green-500 dark:bg-green-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-500">
                    <ShieldXIcon className="w-4 h-4" />
                    Inactivas
                  </span>
                  <span className="font-medium">
                    {inactiveLicencias.toLocaleString()} ({(100 - activeLicenciasPercentage).toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={100 - activeLicenciasPercentage}
                  className="h-2 bg-red-500 dark:bg-red-600"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4 flex flex-col items-start gap-1">
            <div className="w-full pt-2 border-t border-border">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="general" className="text-xs">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="distribucion" className="text-xs">
                    Distribución
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="pt-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                      <span className="text-xs text-muted-foreground">Última activación</span>
                      <span className="font-medium">
                        {licencias.length > 0
                          ? new Date(
                              licencias[licencias.length - 1].inicio || Date.now(),
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted/50 rounded-md">
                      <span className="text-xs text-muted-foreground">Activaciones recientes</span>
                      <span className="font-medium">
                        {
                          licencias.filter(
                            (l) => new Date(l.inicio || 0) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                          ).length
                        }{" "}
                        licencias
                      </span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="distribucion" className="pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <UsersIcon className="w-4 h-4 text-blue-500" />
                        Usuarios con licencia
                      </span>
                      <span className="font-medium">
                        {usuariosConLicencia} de {activeUsuarios}
                      </span>
                    </div>
                    <Progress
                      value={activeUsuarios > 0 ? (usuariosConLicencia / activeUsuarios) * 100 : 0}
                      className="h-2 bg-blue-500"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {usuariosSinLicencia} usuarios activos sin licencia asignada
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Tarjeta de resumen combinado */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Resumen general</CardTitle>
          <CardDescription>Estadísticas combinadas de usuarios y licencias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <span className="text-xs text-muted-foreground">Usuarios activos</span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {activeUsuarios.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {activeUsuariosPercentage.toFixed(1)}% del total
              </span>
            </div>

            <div className="flex flex-col p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <span className="text-xs text-muted-foreground">Licencias activas</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {activeLicencias.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {activeLicenciasPercentage.toFixed(1)}% del total
              </span>
            </div>

            <div className="flex flex-col p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <span className="text-xs text-muted-foreground">Licencias por usuario</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{licenciasPorUsuario}</span>
              <span className="text-xs text-muted-foreground mt-1">Promedio por usuario activo</span>
            </div>

            <div className="flex flex-col p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <span className="text-xs text-muted-foreground">Cobertura de licencias</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {usuariosConLicenciaPercentage.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {usuariosConLicencia} de {activeUsuarios} usuarios
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center justify-between w-full">
            <span>Última actualización: {new Date().toLocaleString()}</span>
            <span className="flex items-center gap-1">
              <ActivityIcon className="h-3 w-3" />
              Datos en tiempo real
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

