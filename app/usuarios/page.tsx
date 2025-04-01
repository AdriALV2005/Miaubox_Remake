"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CrearUsuarioDialog } from "@/components/usuario/CrearUsuario"
import { EditarUsuarioDialog } from "@/components/usuario/EditarUsuarioDialog"
import { ConfirmarEliminacionDialog } from "@/components/usuario/ConfirmarEliminacionDialog"
import type { Usuario } from "@/types/usuario"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  RefreshCw,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Phone,
  UserCheck,
  UserX,
} from "lucide-react"
import * as XLSX from "xlsx"
import { toZonedTime } from "date-fns-tz"

const timeZone = "America/Lima"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSummary, setShowSummary] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  const fetchUsuarios = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/usuarios")
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error("Error al obtener los usuarios")
      }
      const data = await response.json()
      setUsuarios(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar los usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchUsuarios()
    setTimeout(() => setIsRefreshing(false), 600) // Mostrar animación por al menos 600ms
  }

  // Función para ordenar datos
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "ascending" ? "descending" : "ascending"
    }

    setSortConfig({ key, direction })

    const sortedData = [...usuarios].sort((a, b) => {
      const aValue = (a as any)[key]
      const bValue = (b as any)[key]

      if (typeof aValue === "string") {
        return direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return direction === "ascending" ? aValue - bValue : bValue - aValue
    })

    setUsuarios(sortedData)
  }

  // Función para exportar a Excel
  const exportToExcel = () => {
    // Preparar los datos para exportar
    const worksheet = XLSX.utils.json_to_sheet(
      usuarios.map((usuario) => {
        return {
          ID: usuario.id,
          Teléfono: usuario.telefono,
          Observación: usuario.observacion,
          Status: usuario.status === 1 ? "Activo" : "Inactivo",
        }
      }),
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios")

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, "Usuarios.xlsx")
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Componente de tabla con animación para filas
  const AnimatedTableRow = motion(TableRow)

  // Calcular estadísticas usando la zona horaria de Perú
  const hoyPeru = toZonedTime(new Date(), timeZone)

  // Calcular estadísticas
  const usuariosActivos = usuarios.filter((u) => u.status === 1).length
  const usuariosInactivos = usuarios.filter((u) => u.status !== 1).length

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>

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

            <CrearUsuarioDialog fetchUsuarios={fetchUsuarios} />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Total Usuarios</p>
                          <h3 className="text-2xl font-bold text-blue-700">{usuarios.length}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-700" />
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
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Usuarios Activos</p>
                          <h3 className="text-2xl font-bold text-green-700">{usuariosActivos}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-green-700" />
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
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Usuarios Inactivos</p>
                          <h3 className="text-2xl font-bold text-red-700">{usuariosInactivos}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                          <UserX className="h-6 w-6 text-red-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabla de Usuarios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Usuarios</CardTitle>
              <CardDescription>{usuarios.length} registros</CardDescription>
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
                            onClick={() => requestSort("telefono")}
                            className="flex items-center gap-1 p-0 h-auto font-semibold whitespace-nowrap"
                          >
                            <Phone className="h-3 w-3 mr-1" /> Teléfono <ArrowUpDown className="h-3 w-3 ml-1" />
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
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("observacion")}
                            className="flex items-center gap-1 p-0 h-auto font-semibold whitespace-nowrap"
                          >
                            <User className="h-3 w-3 mr-1" /> Observación <ArrowUpDown className="h-3 w-3 ml-1" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
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
                                <Skeleton className="h-5 w-16" />
                              </TableCell>
                              <TableCell>
                                <Skeleton className="h-5 w-40" />
                              </TableCell>
                              <TableCell className="text-right">
                                <Skeleton className="h-9 w-20 ml-auto" />
                              </TableCell>
                            </TableRow>
                          ))
                      ) : usuarios.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No hay usuarios registrados
                          </TableCell>
                        </TableRow>
                      ) : (
                        usuarios.map((usuario, index) => (
                          <AnimatedTableRow
                            key={usuario.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                          >
                            <TableCell className="font-medium whitespace-nowrap">{usuario.id}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                {usuario.telefono}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant={usuario.status === 1 ? "default" : "secondary"}
                                className={
                                  usuario.status === 1
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }
                              >
                                {usuario.status === 1 ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] md:max-w-[300px] truncate">
                              {usuario.observacion}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                <EditarUsuarioDialog usuario={usuario} fetchUsuarios={fetchUsuarios} />
                                <ConfirmarEliminacionDialog usuarioId={usuario.id} fetchUsuarios={fetchUsuarios} />
                              </div>
                            </TableCell>
                          </AnimatedTableRow>
                        ))
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

