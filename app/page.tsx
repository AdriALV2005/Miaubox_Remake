import { GraficoIngresosEgresos } from "../components/Graficos/graficos";
import { CardsUsersLicencias } from "@/components/Graficos/cardsUser";



export default function Home() {
  return (
    <div className="p-6">
      <section className="mt-8">
        <div className="flex flex-col gap-4">
          {/* Cards se muestran arriba en dos columnas */}
          <CardsUsersLicencias />
          {/* Gráficos en grid */}
            <GraficoIngresosEgresos />
        </div>
      </section>
    </div>
  );
}