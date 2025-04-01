"use client"

import { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatearFecha } from "@/utils/util"
import type { Ingreso } from "@/types/ingreso"
import type { Egreso } from "@/types/egreso"
import { Button } from "@/components/ui/button"
import { CrearEgresoDialog } from "@/components/usuario/CrearEgreso"
import { ModalVerMas } from "@/components/ingreso/ModalVerMas"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  RefreshCw,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// Componente para el resumen financiero
const ResumenFinanciero = ({
  ingresos,
  egresos,
  isVisible,
}: { ingresos: Ingreso[]; egresos: Egreso[]; isVisible: boolean }) => {
  const totalIngresos = useMemo(
    () => ingresos.reduce((sum, ingreso) => sum + Number(ingreso.monto_ingreso), 0),
    [ingresos],
  )

  const totalEgresos = useMemo(() => egresos.reduce((sum, egreso) => sum + Number(egreso.monto_egreso), 0), [egresos])

  const balance = totalIngresos - totalEgresos

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 overflow-hidden"
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Total Ingresos</p>
                    <h3 className="text-2xl font-bold text-green-700">S/.{totalIngresos.toFixed(2)}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-700" />
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
                    <p className="text-sm font-medium text-red-800">Total Egresos</p>
                    <h3 className="text-2xl font-bold text-red-700">S/.{totalEgresos.toFixed(2)}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-200 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-700" />
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
            <Card
              className={`bg-gradient-to-br ${balance >= 0 ? "from-blue-50 to-blue-100 border-blue-200" : "from-orange-50 to-orange-100 border-orange-200"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Balance</p>
                    <h3 className={`text-2xl font-bold ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                      S/.{balance.toFixed(2)}
                    </h3>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-full ${balance >= 0 ? "bg-blue-200" : "bg-orange-200"} flex items-center justify-center`}
                  >
                    <DollarSign className={`h-6 w-6 ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [egresos, setEgresos] = useState<Egreso[]>([])
  const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
    table: "ingresos" | "egresos"
  } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSummary, setShowSummary] = useState(true)

  const fetchIngresos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ingresos")
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error("Error al obtener los ingresos")
      }
      const data = await response.json()
      setIngresos(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEgresos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/egresos")
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error("Error al obtener los egresos")
      }
      const data = await response.json()
      setEgresos(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIngresos()
    fetchEgresos()
  }, [])

  const handleVerMas = (ingreso: Ingreso) => {
    setSelectedIngreso(ingreso)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedIngreso(null)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchIngresos(), fetchEgresos()])
    setTimeout(() => setIsRefreshing(false), 600) // Mostrar animación por al menos 600ms
  }

  // Función para ordenar datos
  const requestSort = (key: string, table: "ingresos" | "egresos") => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.table === table) {
      direction = sortConfig.direction === "ascending" ? "descending" : "ascending"
    }

    setSortConfig({ key, direction, table })

    if (table === "ingresos") {
      const sortedData = [...ingresos].sort((a, b) => {
        // Manejar propiedades anidadas
        let aValue, bValue

        if (key.includes(".")) {
          const keys = key.split(".")
          let aTemp = a as any
          let bTemp = b as any

          for (const k of keys) {
            aTemp = aTemp[k]
            bTemp = bTemp[k]
          }

          aValue = aTemp
          bValue = bTemp
        } else {
          aValue = (a as any)[key]
          bValue = (b as any)[key]
        }

        if (typeof aValue === "string") {
          return direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return direction === "ascending" ? aValue - bValue : bValue - aValue
      })

      setIngresos(sortedData)
    } else {
      const sortedData = [...egresos].sort((a, b) => {
        // Manejar propiedades anidadas
        let aValue, bValue

        if (key.includes(".")) {
          const keys = key.split(".")
          let aTemp = a as any
          let bTemp = b as any

          for (const k of keys) {
            aTemp = aTemp[k]
            bTemp = bTemp[k]
          }

          aValue = aTemp
          bValue = bTemp
        } else {
          aValue = (a as any)[key]
          bValue = (b as any)[key]
        }

        if (typeof aValue === "string") {
          return direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return direction === "ascending" ? aValue - bValue : bValue - aValue
      })

      setEgresos(sortedData)
    }
  }

  // Función para exportar a Excel
  const exportToExcel = (data: any[], fileName: string) => {
    // Preparar los datos para exportar
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => {
        // Crear un objeto plano para Excel
        const flatItem: any = {}

        // Para ingresos
        if ("licencia" in item) {
          flatItem.ID = item.id
          flatItem.Usuario = item.licencia.usuario.observacion
          flatItem.Plataforma = item.licencia.servicio.plataforma
          flatItem.Detalles = item.detalles
          flatItem.Monto = item.monto_ingreso
          flatItem.Fecha = formatearFecha(item.fecha_ingreso)
        }
        // Para egresos
        else {
          flatItem.ID = item.id
          flatItem.Servicio = item.servicio.plataforma
          flatItem.Detalles = item.detalles
          flatItem.Monto = item.monto_egreso
          flatItem.Fecha = formatearFecha(item.fecha_egreso)
        }

        return flatItem
      }),
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  // Componente de tabla con animación para filas
  const AnimatedTableRow = motion(TableRow)

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestión Financiera</h1>

          <div className="flex gap-2">
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
          </div>
        </div>

        {/* Resumen financiero */}
        <ResumenFinanciero ingresos={ingresos} egresos={egresos} isVisible={showSummary} />

        <Tabs defaultValue="ingresos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            <TabsTrigger value="egresos">Egresos</TabsTrigger>
          </TabsList>

          {/* Tabla de Ingresos */}
          <TabsContent value="ingresos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">Ingresos</CardTitle>
                  <CardDescription>{ingresos.length} registros</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToExcel(ingresos, "Ingresos")}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar Excel</span>
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full overflow-auto">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">
                            <Button
                              variant="ghost"
                              onClick={() => requestSort("id", "ingresos")}
                              className="flex items-center gap-1 p-0 h-auto font-semibold"
                            >
                              ID <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => requestSort("licencia.usuario.observacion", "ingresos")}
                              className="flex items-center gap-1 p-0 h-auto font-semibold"
                            >
                              Usuario <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => requestSort("licencia.servicio.plataforma", "ingresos")}
                              className="flex items-center gap-1 p-0 h-auto font-semibold"
                            >
                              Plataforma <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="hidden md:table-cell">Detalles</TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => requestSort("monto_ingreso", "ingresos")}
                              className="flex items-center gap-1 p-0 h-auto font-semibold"
                            >
                              Monto <ArrowUpDown className="h-3 w-3" />
                            </Button>
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
                                <TableCell className="hidden md:table-cell">
                                  <Skeleton className="h-5 w-40" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-5 w-16" />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Skeleton className="h-9 w-20 ml-auto" />
                                </TableCell>
                              </TableRow>
                            ))
                        ) : ingresos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No hay ingresos registrados
                            </TableCell>
                          </TableRow>
                        ) : (
                          ingresos.map((ingreso, index) => (
                            <AnimatedTableRow
                              key={ingreso.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            >
                              <TableCell className="font-medium">{ingreso.id}</TableCell>
                              <TableCell className="truncate max-w-[100px] md:max-w-none">
                                {ingreso.licencia.usuario.observacion}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50">
                                  {ingreso.licencia.servicio.plataforma}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell truncate max-w-[150px] lg:max-w-none">
                                {ingreso.detalles}
                              </TableCell>
                              <TableCell className="font-semibold text-green-600">
                                S/.{Number(ingreso.monto_ingreso).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() => handleVerMas(ingreso)}
                                  className="w-full sm:w-auto"
                                  variant="secondary"
                                >
                                  Ver más
                                </Button>
                              </TableCell>
                            </AnimatedTableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tabla de Egresos */}
          <TabsContent value="egresos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">Egresos</CardTitle>
                  <CardDescription>{egresos.length} registros</CardDescription>
                </div>
                <div className="flex gap-2">
                  <CrearEgresoDialog fetchEgresos={fetchEgresos} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToExcel(egresos, "Egresos")}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar Excel</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="w-full overflow-auto">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">
                            <Button
                              variant="ghost"
                              onClick={() => requestSort("id", "egresos")}
                              className="flex items-center gap-1 p-0 h-auto font-semibold"
                            >
                              ID <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => requestSort("servicio.plataforma", "egresos")}
                              className="flex items-center gap-1 p-0 h-auto font-semibold"
                            >
                              Servicio <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="hidden md:table-cell">Detalles</TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => requestSort("monto_egreso", "egresos")}
                              className="flex items-center gap-1 p-0 h-auto font-semibold"
                            >
                              Monto <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </TableHead>
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
                                <TableCell className="hidden md:table-cell">
                                  <Skeleton className="h-5 w-40" />
                                </TableCell>
                                <TableCell>
                                  <Skeleton className="h-5 w-16" />
                                </TableCell>
                              </TableRow>
                            ))
                        ) : egresos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                              No hay egresos registrados
                            </TableCell>
                          </TableRow>
                        ) : (
                          egresos.map((egreso, index) => (
                            <AnimatedTableRow
                              key={egreso.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            >
                              <TableCell className="font-medium">{egreso.id}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-purple-50">
                                  {egreso.servicio.plataforma}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell truncate max-w-[150px] lg:max-w-none">
                                {egreso.detalles}
                              </TableCell>
                              <TableCell className="font-semibold text-red-600">
                                S/.{Number(egreso.monto_egreso).toFixed(2)}
                              </TableCell>
                            </AnimatedTableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Modal Ver Más */}
      {isModalOpen && selectedIngreso && (
        <ModalVerMas selectedIngreso={selectedIngreso} handleCloseModal={handleCloseModal} />
      )}
    </div>
  )
}

