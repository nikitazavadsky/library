import { ORDER_STATUS_MAP, PENDING } from "@/constants/orderStatusMap";
import {
  useRejectOrderMutation,
  useApproveOrderMutation,
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
  const approveOrderMutation = useApproveOrderMutation();
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
                {order.first_name} {order.last_name}
              </td>
            )}
            <td>
              <ul>
                {order.requested_books.map((book) => (
                  <Link key={book.id} href={`books/${book.id}`}>
                    <li key={book.id} className="link-hover">
                      {book.title}
                    </li>
                  </Link>
                ))}
              </ul>
            </td>
            <td>{ORDER_STATUS_MAP[order.status]}</td>
            <td>{order.created_at}</td>
            {isAdmin && (
              <td>
                {order.status === PENDING && (
                  <button
                    className="btn-error btn ml-auto"
                    onClick={() => rejectOrderMutation.mutate(order.id)}
                  >
                    Reject
                  </button>
                )}
                {order.status === PENDING && (
                  <button
                    className="btn-success btn ml-auto"
                    onClick={() => approveOrderMutation.mutate(order.id)}
                  >
                    Approve
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
