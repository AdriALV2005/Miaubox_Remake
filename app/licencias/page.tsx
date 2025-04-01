"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmarEliminacionDialog } from "@/components/licencia/ConfirmarEliminacionDialog"
import { CrearLicenciaDialog } from "@/components/licencia/CrearLicencia"
import { EditarLicenciaDialog } from "@/components/licencia/EditarLicenciaDialog"
import type { Licencia } from "@/types/licencia"
import type { Usuario } from "@/types/usuario"
import type { Servicio } from "@/types/servicio"
import { formatearFecha, getServicioPlataforma, getUsuarioObservacion } from "@/utils/util"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  RefreshCw,
  ArrowUpDown,
  Shield,
  User,
  Monitor,
  Mail,
  Key,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
} from "lucide-react"
import * as XLSX from "xlsx"
import { toZonedTime } from "date-fns-tz"

const timeZone = "America/Lima"

export default function LicenciasPage() {
  const [licencias, setLicencias] = useState<Licencia[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)
  const [showSummary, setShowSummary] = useState(true)

  const fetchLicencias = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/licencias")
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error("Error al obtener las licencias")
      }
      const data = await response.json()
      setLicencias(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar las licencias")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsuarios = async () => {
    try {
      const res = await fetch("/api/usuarios?status=1")
      const data = await res.json()
      setUsuarios(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar los usuarios")
    }
  }

  const fetchServicios = async () => {
    try {
      const res = await fetch("/api/servicios?status=1")
      const data = await res.json()
      setServicios(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar los servicios")
    }
  }

  const handleRenovar = async (licencia: Licencia) => {
    try {
      const selectedServicio = servicios.find((s) => s.id === licencia.servicio_id)
      if (!selectedServicio) {
        throw new Error("Servicio no encontrado")
      }

      const nuevaFechaInicio = new Date(licencia.inicio)
      nuevaFechaInicio.setMonth(nuevaFechaInicio.getMonth() + 1)

      const nuevaFechaFin = new Date(licencia.fin)
      nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + 1)

      // Cambia la ruta para llamar al endpoint fijo
      const response = await fetch(`/api/licencias`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: licencia.id,
          inicio: nuevaFechaInicio.toISOString(),
          fin: nuevaFechaFin.toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al renovar la licencia")
      }

      await fetch("/api/ingresos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licencia_id: licencia.id,
          detalles: `RENOVACIÓN LICENCIA`,
          monto_ingreso: selectedServicio.precio_vender,
        }),
      })

      fetchLicencias()
      toast.success("Licencia renovada exitosamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Hubo un error al renovar la licencia")
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchLicencias(), fetchUsuarios(), fetchServicios()])
    setTimeout(() => setIsRefreshing(false), 600) // Mostrar animación por al menos 600ms
  }

  // Función para ordenar datos
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "ascending" ? "descending" : "ascending"
    }

    setSortConfig({ key, direction })

    const sortedData = [...licencias].sort((a, b) => {
      // Manejar propiedades especiales
      let aValue, bValue

      if (key === "usuario") {
        aValue = getUsuarioObservacion(usuarios, a.user_id)
        bValue = getUsuarioObservacion(usuarios, b.user_id)
      } else if (key === "servicio") {
        aValue = getServicioPlataforma(servicios, a.servicio_id)
        bValue = getServicioPlataforma(servicios, b.servicio_id)
      } else {
        aValue = (a as any)[key]
        bValue = (b as any)[key]
      }

      if (typeof aValue === "string") {
        return direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (key === "inicio" || key === "fin") {
        return direction === "ascending"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime()
      }

      return direction === "ascending" ? aValue - bValue : bValue - aValue
    })

    setLicencias(sortedData)
  }

  // Función para exportar a Excel
  const exportToExcel = () => {
    // Preparar los datos para exportar
    const worksheet = XLSX.utils.json_to_sheet(
      licencias.map((licencia) => {
        // Calcular días restantes con zona horaria de Perú
        const fechaFin = toZonedTime(new Date(licencia.fin), timeZone)
        const hoyPeru = toZonedTime(new Date(), timeZone)

        // Resetear las horas para comparar solo fechas
        const fechaFinSinHora = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate())
        const hoyPeruSinHora = new Date(hoyPeru.getFullYear(), hoyPeru.getMonth(), hoyPeru.getDate())

        // Calcular la diferencia en días
        const diasRestantes = Math.floor((fechaFinSinHora.getTime() - hoyPeruSinHora.getTime()) / (1000 * 60 * 60 * 24))

        return {
          ID: licencia.id,
          Usuario: getUsuarioObservacion(usuarios, licencia.user_id),
          Servicio: getServicioPlataforma(servicios, licencia.servicio_id),
          Inicio: formatearFecha(licencia.inicio),
          Fin: formatearFecha(licencia.fin),
          "Días Restantes": diasRestantes,
          Status: licencia.status === 1 ? "Activo" : "Inactivo",
          Correo: licencia.correo,
          Contraseña: licencia.contraseña,
        }
      }),
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Licencias")

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, "Licencias.xlsx")
  }

  useEffect(() => {
    fetchLicencias()
    fetchUsuarios()
    fetchServicios()
  }, [])

  // Componente de tabla con animación para filas
  const AnimatedTableRow = motion(TableRow)

  // Obtener la fecha actual en Perú
  const hoyPeru = toZonedTime(new Date(), timeZone)
  const mananaPeru = new Date(hoyPeru)

  mananaPeru.setDate(hoyPeru.getDate() - 2)

  // Resetear las horas para comparar solo fechas
  const hoyPeruSinHora = new Date(hoyPeru.getFullYear(), hoyPeru.getMonth(), (hoyPeru.getDate()-1))
  const mananaPeruSinHora = new Date(mananaPeru.getFullYear(), mananaPeru.getMonth(), mananaPeru.getDate())

  // Calcular estadísticas
  const licenciasActivas = licencias.filter((l) => l.status === 1).length
  const licenciasInactivas = licencias.filter((l) => l.status !== 1).length

  const vencenHoy = licencias.filter((l) => {
    if (l.status !== 1) return false
    const fechaFinPeru = toZonedTime(new Date(l.fin), timeZone)
    const fechaFinSinHora = new Date(fechaFinPeru.getFullYear(), fechaFinPeru.getMonth(), fechaFinPeru.getDate())
    return fechaFinSinHora.getTime() === hoyPeruSinHora.getTime()
  }).length

  const vencenManana = licencias.filter((l) => {
    if (l.status !== 1) return false
    const fechaFinPeru = toZonedTime(new Date(l.fin), timeZone)
    const fechaFinSinHora = new Date(fechaFinPeru.getFullYear(), fechaFinPeru.getMonth(), fechaFinPeru.getDate())
    return fechaFinSinHora.getTime() === mananaPeruSinHora.getTime()
  }).length

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Licencias</h1>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center gap-1"
            >
              {showSummary ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Ocultar Resumen</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span className="hidden sm:inline">Mostrar Resumen</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className={`${isRefreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Actualizar</span>
            </Button>

            <Button variant="outline" size="sm" onClick={exportToExcel} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </Button>

            <CrearLicenciaDialog fetchLicencias={fetchLicencias} />
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Licencias Activas</p>
                          <h3 className="text-2xl font-bold text-green-700">{licenciasActivas}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-green-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Licencias Inactivas</p>
                          <h3 className="text-2xl font-bold text-red-700">{licenciasInactivas}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-red-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-red-100 to-red-200 border-red-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Vencen Hoy</p>
                          <h3 className="text-2xl font-bold text-red-700">{vencenHoy}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-red-300 flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-red-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-800">Vencen Mañana</p>
                          <h3 className="text-2xl font-bold text-amber-700">{vencenManana}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-300 flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-amber-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabla de Licencias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Licencias</CardTitle>
              <CardDescription>{licencias.length} registros</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-auto">
              <div className="rounded-md border min-w-full" style={{ overflowX: "auto" }}>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("id")}
                            className="flex items-center gap-1 p-0 h-auto font-semibold"
                          >
                            ID <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("usuario")}
                            className="flex items-center gap-1 p-0 h-auto font-semibold whitespace-nowrap"
                          >
                            <User className="h-3 w-3 mr-1" /> Usuario <ArrowUpDown className="h-3 w-3 ml-1" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("servicio")}
                            className="flex items-center gap-1 p-0 h-auto font-semibold whitespace-nowrap"
                          >
                            <Monitor className="h-3 w-3 mr-1" /> Servicio <ArrowUpDown className="h-3 w-3 ml-1" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("inicio")}
                            className="flex items-center gap-1 p-0 h-auto font-semibold whitespace-nowrap"
                          >
                            Inicio <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("fin")}
                            className="flex items-center gap-1 p-0 h-auto font-semibold whitespace-nowrap"
                          >
                            Fin <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("status")}
                            className="flex items-center gap-1 p-0 h-auto font-semibold whitespace-nowrap"
                          >
                            Status <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center whitespace-nowrap">
                            <Mail className="h-3 w-3 mr-1" /> Correo
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center whitespace-nowrap">
                            <Key className="h-3 w-3 mr-1" /> Contraseña
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {isLoading ? (
                        // Skeleton loader
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={`skeleton-${index}`}>
                              <TableCell>
                                <Skeleton className="h-5 w-10" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-32" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-24" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-24" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-24" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-16" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-32" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-24" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-9 w-32 ml-auto" />
                              </TableCell>
                            </TableRow>
                          ))
                      ) : licencias.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            No hay licencias registradas
                          </TableCell>
                        </TableRow>
                      ) : (
                        licencias.map((licencia, index) => {
                          // Tomar la fecha de fin y convertirla a zona horaria de Perú
                          const fechaFin = toZonedTime(new Date(licencia.fin), timeZone)

                          // Resetear las horas para comparar solo fechas
                          const fechaFinSinHora = new Date(
                            fechaFin.getFullYear(),
                            fechaFin.getMonth(),
                            fechaFin.getDate(),
                          )

                          // Comparar fechas exactas para determinar si vence hoy o mañana
                          const venceHoy = fechaFinSinHora.getTime() === hoyPeruSinHora.getTime()
                          const venceManana = fechaFinSinHora.getTime() === mananaPeruSinHora.getTime()

                          // Calcular días restantes (puede ser negativo si ya venció)
                          const diasRestantes = Math.floor(
                            (fechaFinSinHora.getTime() - hoyPeruSinHora.getTime()) / (1000 * 60 * 60 * 24) +2,
                          )

                          // Determinar el color de fondo de la fila
                          let rowBgColor = ""
                          if (licencia.status === 1) {
                            if (venceHoy) rowBgColor = "bg-red-100"
                            else if (venceManana) rowBgColor = "bg-amber-100"
                            else if (diasRestantes < 0) rowBgColor = "bg-red-50"
                            else if (diasRestantes <= 7) rowBgColor = "bg-amber-50"
                          }

                          return (
                            <AnimatedTableRow
                              key={licencia.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              whileHover={{
                                backgroundColor: "rgba(0,0,0,0.02)",
                              }}
                              className={rowBgColor}
                            >
                              <TableCell className="font-medium whitespace-nowrap">{licencia.id}</TableCell>
                              <TableCell className="truncate max-w-[100px] md:max-w-none whitespace-nowrap">
                                {getUsuarioObservacion(usuarios, licencia.user_id)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge variant="outline" className="bg-blue-50">
                                  {getServicioPlataforma(servicios, licencia.servicio_id)}
                                </Badge>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{formatearFecha(licencia.inicio)}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span>{formatearFecha(licencia.fin)}</span>
                                  {venceHoy && licencia.status === 1 && (
                                    <span className="text-xs text-red-600 font-bold flex items-center">
                                      <AlertCircle className="h-3 w-3 mr-1" /> ¡Vence HOY!
                                    </span>
                                  )}
                                  {venceManana && licencia.status === 1 && (
                                    <span className="text-xs text-amber-600 font-bold flex items-center">
                                      <AlertTriangle className="h-3 w-3 mr-1" /> ¡Vence MAÑANA!
                                    </span>
                                  )}
                                  {!venceHoy &&
                                    !venceManana &&
                                    diasRestantes > 0 &&
                                    diasRestantes <= 7 &&
                                    licencia.status === 1 && (
                                      <span className="text-xs text-amber-600 font-semibold">
                                        {/* {diasRestantes - 1} días restantes */}
                                      </span>
                                    )}
                                  {!venceHoy && !venceManana && diasRestantes > 7 && licencia.status === 1 && (
                                    <span className="text-xs text-gray-500">
                                      {/* {diasRestantes} días restantes */}
                                      </span>
                                  )}
                                  {diasRestantes < 0 && licencia.status === 1 && (
                                    <span className="text-xs text-red-600 font-semibold">
                                      {/* Vencida hace {Math.abs(diasRestantes)} días */}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge
                                  variant={licencia.status === 1 ? "default" : "secondary"}
                                  className={
                                    licencia.status === 1
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                  }
                                >
                                  {licencia.status === 1 ? "Activo" : "Inactivo"}
                                </Badge>
                              </TableCell>
                              <TableCell className="truncate max-w-[150px] lg:max-w-none whitespace-nowrap">
                                {licencia.correo}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{licencia.contraseña}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                  <EditarLicenciaDialog licencia={licencia} fetchLicencias={fetchLicencias} />
                                  <ConfirmarEliminacionDialog
                                    licenciaId={licencia.id}
                                    fetchLicencias={fetchLicencias}
                                  />
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleRenovar(licencia)}
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                                  >
                                    Renovar
                                  </Button>
                                </div>
                              </TableCell>
                            </AnimatedTableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

