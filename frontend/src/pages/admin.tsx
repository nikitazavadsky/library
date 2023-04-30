import { type ChangeEvent, useState } from "react";
import OrderTable from "@/components/orderTable";
import { useOrdersQuery } from "@/queries/useOrders";
import { useAllUsersQuery } from "../queries/useUser";
import axios from "axios";
import BaseModal from "@/components/baseModal";
import useBlockUserMutation from "@/mutations/useUser";
import Head from "next/head";
import { useAuthStore } from "@/stores/auth";

async function handleDownloadAnalytics() {
  try {
    const response = await axios.get("analytics/report", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: response.headers["Content-Type"] as string,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app-analytics.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
  }
}

function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0] ?? null;
  if (file) {
    void uploadFile(file);
  }
}

async function uploadFile(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("items/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("File uploaded successfully:", response.data);
  } catch (error) {
    console.error("Upload error:", error);
  }
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "users">("orders");
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const { user } = useAuthStore();
  const currentUserEmail = user?.email;

  const blockUserMutation = useBlockUserMutation(() =>
    setOpenDeleteModal(false)
  );

  const { data: ordersData } = useOrdersQuery();
  const { data: usersData } = useAllUsersQuery();

  return (
    <>
      <Head>
        <title>Admin Panel</title>
      </Head>
      <BaseModal
        visible={openDeleteModal}
        closeModal={() => setOpenDeleteModal(!openDeleteModal)}
        modalId="remove-user-modal"
        title={`Do you really want to block user with id ${String(
          userIdToDelete
        )}?`}
        titleClassname="text-2xl font-extrabold uppercase text-warning"
        modalAction={
          <>
            <button
              type="button"
              className="btn-error btn"
              onClick={() => {
                if (userIdToDelete) blockUserMutation.mutate(userIdToDelete);
              }}
            >
              Yes, block user
            </button>
            <button
              type="button"
              className="btn-info btn"
              onClick={() => setOpenDeleteModal(false)}
            >
              No, cancel
            </button>
          </>
        }
      >
        <p>
          This action cannot be undone. User will be flagged as blocked. Orders
          and user data will be preserved, but user won&apos;t be able to log in
          or make any orders.
        </p>
      </BaseModal>
      <div className="m-12 bg-base-300 p-8">
        <div className="mb-5 flex flex-col gap-4">
          <button className="btn-info btn" onClick={handleDownloadAnalytics}>
            Download Analytics
          </button>
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            id="file-input"
            onChange={handleFileChange}
          />
          <button
            className="btn-error btn"
            onClick={() => {
              document.getElementById("file-input")?.click();
            }}
          >
            Bulk Load
          </button>
        </div>

        <div className="tabs">
          <a
            className={`tab-bordered tab ${
              activeTab === "orders" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </a>
          <a
            className={`tab-bordered tab ${
              activeTab === "users" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </a>
        </div>

        {activeTab === "orders" && ordersData?.data && (
          <OrderTable ordersData={ordersData.data} isAdmin />
        )}
        {activeTab === "users" && usersData?.data ? (
          <table className="table w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.data.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.first_name} {user.last_name}
                  </td>
                  <td>{user.email}</td>
                  {user.email != currentUserEmail ? (
                    <td>
                      <button
                        className="btn-error btn"
                        onClick={() => {
                          setUserIdToDelete(user.id);
                          setOpenDeleteModal(true);
                        }}
                      >
                        Block User
                      </button>
                    </td>
                  ) : (
                    <td>
                      <div className="alert alert-info">
                        <span>You can&apos;t block yourself!</span>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </>
  );
}
