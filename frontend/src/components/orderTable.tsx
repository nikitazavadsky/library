import { ORDER_STATUS_MAP } from "@/constants/orderStatusMap";
import {
  useRejectOrderMutation,
  useMoveOrderMutation,
} from "@/mutations/useOrders";
import { type OrdersData } from "@/queries/useOrders";
import Link from "next/link";

export default function OrderTable({
  ordersData,
  isAdmin = false,
}: {
  ordersData: OrdersData[];
  isAdmin?: boolean;
}) {
  const moveOrderMutation = useMoveOrderMutation();
  const rejectOrderMutation = useRejectOrderMutation();

  if (!ordersData) return null;

  return (
    <table className="table w-full">
      <thead>
        <tr>
          <th>Order ID</th>
          {isAdmin && <th>Full Name</th>}
          <th>Books</th>
          <th>Order Status</th>
          <th>Created At</th>
          {isAdmin && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {ordersData.map((order) => (
          <tr key={order.id}>
            <td>{order.id}</td>
            {isAdmin && (
              <td>
                {order.firstName} {order.lastName}
              </td>
            )}
            <td>
              <ul>
                {order.requested_books.map(book => (
                  <Link href={`books/${book.id}`}>
                    <li key={book.id} className='link-hover'>{book.title}</li>
                  </Link>
                ))}
              </ul>
            </td>
            <td>{ORDER_STATUS_MAP[order.status]}</td>
            <td>{order.created_at}</td>
            {isAdmin && (
              <td className="flex justify-between">
                {/* {order.status === "IN_PROCESSING" && (
                  <>
                    <button
                      className="btn-success btn"
                      onClick={() => moveOrderMutation.mutate(order.id)}
                    >
                      Move to &quot;In Delivery&quot;
                    </button>
                    <button
                      className="btn-error btn ml-auto"
                      onClick={() => rejectOrderMutation.mutate(order.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                {order.status === "IN_DELIVERY" && (
                  <button
                    className="btn-success btn"
                    onClick={() => moveOrderMutation.mutate(order.id)}
                  >
                    Move to &quot;Delivered&quot;
                  </button>
                )} */}
                <button
                      className="btn-error btn ml-auto"
                      onClick={() => rejectOrderMutation.mutate(order.id)}
                    >
                      Reject
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
