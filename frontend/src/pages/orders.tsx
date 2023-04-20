import { Container, Paper, Tabs, type TabsValue } from "@mantine/core";
import OrderTable from "@/components/orderTable";
import { useMyOrdersQuery } from "@/queries/useOrders";
import Loader from "@/components/loader";
import Head from "next/head";

export default function MyOrdersPage() {
  const { data: ordersData, isLoading } = useMyOrdersQuery();
  if (isLoading) return <Loader />;
  return ordersData ? (
    <>
      <Head>
        <title>My orders</title>
      </Head>
      <Container>
        <Paper className="my-8 p-6">
          <OrderTable ordersData={ordersData} isAdmin={false} />
        </Paper>
      </Container>
    </>
  ) : null;
}
