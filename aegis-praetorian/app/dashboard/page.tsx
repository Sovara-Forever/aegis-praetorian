import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMarketOverview, getDealerStats } from "@/lib/queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const overview = await getMarketOverview();
  const dealerStats = await getDealerStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-muted-foreground">
          Real-time automotive inventory intelligence and analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Inventory
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(overview.totalVehicles)}
            </div>
            <p className="text-xs text-muted-foreground">
              vehicles in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Price
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.averagePrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              across all vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Dealers
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(overview.dealerCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              competing dealers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Makes and Models */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Makes</CardTitle>
            <CardDescription>Most common vehicle manufacturers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.topMakes.length > 0 ? (
                overview.topMakes.map((make, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {make.make}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(make.count)} vehicles
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {overview.totalVehicles > 0
                        ? ((make.count / overview.totalVehicles) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Models</CardTitle>
            <CardDescription>Most popular vehicle models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.topModels.length > 0 ? (
                overview.topModels.map((model, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {model.make} {model.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(model.count)} vehicles
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {overview.totalVehicles > 0
                        ? ((model.count / overview.totalVehicles) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dealer Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Dealer Performance</CardTitle>
          <CardDescription>Top dealers by inventory size</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dealerStats.length > 0 ? (
              dealerStats.map((dealer, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {dealer.dealer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(dealer.totalInventory)} vehicles • Avg:{" "}
                      {formatCurrency(dealer.avgPrice)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No dealer data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price Distribution */}
      {overview.priceDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
            <CardDescription>Inventory segmented by price range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.priceDistribution.map((range, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {range.range}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(Number(range.count))} vehicles
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {overview.totalVehicles > 0
                      ? ((Number(range.count) / overview.totalVehicles) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
