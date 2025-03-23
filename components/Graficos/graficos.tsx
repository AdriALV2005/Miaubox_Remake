"use client"

import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Label,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { TrendingUpIcon, TrendingDownIcon, ArrowDownIcon, DollarSignIcon, PercentIcon } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Ingreso } from "@/types/ingreso"
import type { Egreso } from "@/types/egreso"

export function GraficoIngresosEgresos() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [egresos, setEgresos] = useState<Egreso[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchIngresos = async () => {
    try {
      const res = await fetch("/api/ingresos")
      if (!res.ok) throw new Error("Error al obtener ingresos")
      const data = await res.json()
      setIngresos(data)
    } catch (error) {
      console.error("Error fetching ingresos:", error)
      debugger
    }
  }

  const fetchEgresos = async () => {
    try {
      const res = await fetch("/api/egresos")
      if (!res.ok) throw new Error("Error al obtener egresos")
      const data = await res.json()
      setEgresos(data)
    } catch (error) {
      console.error("Error fetching egresos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIngresos()
    fetchEgresos()
  }, [])

  // Calcular totales
  const totalIngresos = ingresos.reduce((sum, ing) => sum + Number(ing.monto_ingreso), 0)
  const totalEgresos = egresos.reduce((sum, eg) => sum + Number(eg.monto_egreso), 0)
  const diferencia = totalIngresos - totalEgresos
  const porcentajeGanancia = totalIngresos > 0 ? (diferencia / totalIngresos) * 100 : 0

  // Datos para el gráfico: dos slices, uno para ingresos y otro para egresos
  const pieChartData = [
    { type: "Ingresos", value: totalIngresos, fill: "hsl(var(--chart-1))" },
    { type: "Egresos", value: totalEgresos, fill: "hsl(var(--chart-2))" },
  ]

  // Configuración para ChartContainer
  const chartConfig = {
    ingresos: {
      label: "Ingresos",
      color: "hsl(var(--chart-1))",
    },
    egresos: {
      label: "Egresos",
      color: "hsl(var(--chart-2))",
    },
  }

  // Agrupar ingresos por mes para el gráfico de línea
  const groupByMonth = (data: any[], montoKey: string) => {
    const months: Record<string, number> = {}

    data.forEach((item) => {
      // Asumiendo que hay una fecha en el objeto, ajusta según tu estructura de datos
      const date = item.fecha_ingreso || item.fecha_egreso || new Date().toISOString()
      const month = new Date(date).toLocaleString("es-ES", { month: "short", year: "2-digit" })

      if (!months[month]) {
        months[month] = 0
      }
      months[month] += Number(item[montoKey])
    })

    return Object.entries(months).map(([month, value]) => ({ month, value }))
  }

  // Datos para el gráfico de línea
  const ingresosPorMes = groupByMonth(ingresos, "monto_ingreso")
  const egresosPorMes = groupByMonth(egresos, "monto_egreso")

  // Combinar datos para el gráfico de línea
  const mesesUnicos = [...new Set([...ingresosPorMes.map((i) => i.month), ...egresosPorMes.map((e) => e.month)])]
  const lineChartData = mesesUnicos
    .map((month) => {
      const ingreso = ingresosPorMes.find((i) => i.month === month)?.value || 0
      const egreso = egresosPorMes.find((e) => e.month === month)?.value || 0
      return {
        month,
        ingresos: ingreso,
        egresos: egreso,
        balance: ingreso - egreso,
      }
    })
    .sort((a, b) => {
      // Ordenar por mes (asumiendo formato "mes-año")
      const [monthA, yearA] = a.month.split("-")
      const [monthB, yearB] = b.month.split("-")
      return yearA === yearB
        ? new Date(0, Number.parseInt(monthA) - 1).getTime() - new Date(0, Number.parseInt(monthB) - 1).getTime()
        : Number.parseInt(yearA) - Number.parseInt(yearB)
    })

  // Datos para el gráfico de barras comparativo
  const barChartData = [
    { name: "Ingresos", valor: totalIngresos },
    { name: "Egresos", valor: totalEgresos },
    { name: "Balance", valor: diferencia },
  ]

  if (isLoading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Cargando datos financieros...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              S/ {totalIngresos.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{ingresos.length} transacciones registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              Egresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              S/ {totalEgresos.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{egresos.length} transacciones registradas</p>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${diferencia >= 0 ? "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900" : "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              {diferencia >= 0 ? (
                <TrendingUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              Balance Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${diferencia >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              S/ {Math.abs(diferencia).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <PercentIcon className="h-4 w-4 text-muted-foreground" />
              <span
                className={`text-sm ${diferencia >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {porcentajeGanancia.toFixed(1)}% {diferencia >= 0 ? "de ganancia" : "de pérdida"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos en pestañas */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="tendencia">Tendencia</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
        </TabsList>

        {/* Pestaña de Resumen */}
        <TabsContent value="resumen">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos vs Egresos</CardTitle>
              <CardDescription>Distribución general de finanzas</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center w-full">
              {/* Gráfico a la izquierda */}
              <div className="w-full md:w-2/3">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="type"
                      innerRadius={60}
                      outerRadius={90}
                      strokeWidth={5}
                      paddingAngle={2}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                  {diferencia >= 0 ? "+" : ""}
                                  {diferencia.toLocaleString("es-PE", { minimumFractionDigits: 0 })}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Diferencia
                                </tspan>
                              </text>
                            )
                          }
                          return null
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>

              {/* Resumen a la derecha */}
              <div className="w-full md:w-1/3 flex flex-col justify-center p-4 md:border-l border-border space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
                      Ingresos
                    </span>
                    <span className="text-xl font-semibold">S/ {totalIngresos.toLocaleString("es-PE")}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[hsl(var(--chart-1))] rounded-full"
                      style={{ width: `${(totalIngresos / (totalIngresos + totalEgresos)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                      Egresos
                    </span>
                    <span className="text-xl font-semibold">S/ {totalEgresos.toLocaleString("es-PE")}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[hsl(var(--chart-2))] rounded-full"
                      style={{ width: `${(totalEgresos / (totalIngresos + totalEgresos)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    {diferencia >= 0 ? (
                      <>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                          <TrendingUpIcon className="w-5 h-5" />
                          Ganancia
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                          <TrendingDownIcon className="w-5 h-5" />
                          Pérdida
                        </span>
                      </>
                    )}
                    <span className="text-xl font-bold">S/ {Math.abs(diferencia).toLocaleString("es-PE")}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {diferencia >= 0
                      ? `Ganancia de S/ ${Math.abs(diferencia).toLocaleString("es-PE")} (${porcentajeGanancia.toFixed(1)}%)`
                      : `Pérdida de S/ ${Math.abs(diferencia).toLocaleString("es-PE")} (${Math.abs(porcentajeGanancia).toFixed(1)}%)`}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm w-full border-t border-border pt-4">
              <div className="leading-none text-muted-foreground">
                Comparativo total de Ingresos y Egresos con detalle
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Pestaña de Tendencia */}
        <TabsContent value="tendencia">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
              <CardDescription>Evolución de ingresos y egresos a lo largo del tiempo</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickFormatter={(value) => `S/ ${value.toLocaleString("es-PE")}`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`S/ ${value.toLocaleString("es-PE")}`, ""]}
                    labelStyle={{ fontWeight: "bold", marginBottom: "5px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    name="Ingresos"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="egresos"
                    name="Egresos"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: "hsl(var(--chart-3))" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <div className="flex flex-wrap gap-4 justify-center w-full">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
                  <span className="text-sm">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                  <span className="text-sm">Egresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]"></div>
                  <span className="text-sm">Balance</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Pestaña de Comparativo */}
        <TabsContent value="comparativo">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Valores</CardTitle>
              <CardDescription>Análisis comparativo de ingresos, egresos y balance</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickFormatter={(value) => `S/ ${value >= 0 ? value.toLocaleString("es-PE") : 0}`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`S/ ${value.toLocaleString("es-PE")}`, ""]}
                    labelStyle={{ fontWeight: "bold", marginBottom: "5px" }}
                  />
                  <Bar dataKey="valor" fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="border-t border-border pt-4">
              <div className="text-sm text-muted-foreground text-center w-full">
                {diferencia >= 0
                  ? `Los ingresos superan a los egresos por S/ ${diferencia.toLocaleString("es-PE")}, lo que representa un ${porcentajeGanancia.toFixed(1)}% de ganancia.`
                  : `Los egresos superan a los ingresos por S/ ${Math.abs(diferencia).toLocaleString("es-PE")}, lo que representa un ${Math.abs(porcentajeGanancia).toFixed(1)}% de pérdida.`}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

