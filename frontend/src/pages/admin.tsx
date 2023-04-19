import { type ChangeEvent, useState, useRef } from "react";
import OrderTable from "@/components/orderTable";
import { useOrdersQuery } from "@/queries/useOrders";
import { useAllUsersQuery } from "../queries/useUser";
import axios from "axios";
import BaseModal from "@/components/baseModal";
import useBlockUserMutation from "@/mutations/useUser";
import { type ItemMutateSchema, itemMutateSchema } from "@/schemas/itemSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateItemMutation } from "@/mutations/useItem";
import ErrorMessage from "@/components/errorMessage";
import Head from "next/head";
import { useAuthStore } from "@/stores/auth";
import { DevTool } from "@hookform/devtools";
import Loader from "@/components/loader";

async function handleDownloadAnalytics() {
  try {
    const response = await axios.get("analytics", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: response.headers["Content-Type"] as string,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "app-analytics.pdf";
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
  const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ItemMutateSchema>({
    resolver: zodResolver(itemMutateSchema),
  });

  const handleCreate = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };
  const { user } = useAuthStore();
  const currentUserEmail = user?.email;
  const formRef = useRef<HTMLFormElement>(null);

  const createItemMutation = useCreateItemMutation();
  const onSuccessCreate = (values: ItemMutateSchema) => {
    console.warn("values", values);
    const { complectation, ...rest } = values;
    const dataToSend = {
      ...rest,
      complectations: [complectation], // We do the rename here because BE expects different name
    };
    createItemMutation.mutate(dataToSend);
    setOpenCreateItemModal(false);
  };

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
          and user data will be preserved, but user won`&apos;`t be able to log
          in or make any orders.
        </p>
      </BaseModal>
      <BaseModal
        visible={openCreateItemModal}
        closeModal={() => setOpenCreateItemModal(!openCreateItemModal)}
        modalId="create-item-modal"
        title={`Creating new item`}
        titleClassname="text-2xl font-extrabold text-success"
        modalAction={
          <>
            <button
              type="button"
              className="btn-success btn"
              onClick={handleCreate}
            >
              Create item
            </button>
            <button
              type="button"
              className="btn-warning btn"
              onClick={() => setOpenCreateItemModal(false)}
            >
              Cancel
            </button>
          </>
        }
      >
        <p>
          Item will be added to the database. On successful creation you will be
          redirected to item page, so you can see your result and adjust details
          if needed.
        </p>
        <form
          ref={formRef}
          className="form-control"
          onSubmit={handleSubmit(onSuccessCreate)}
        >
          <label className="label">
            <span className="label-text">Category</span>
          </label>
          <input
            {...register("category")}
            type="text"
            placeholder="Enter category of the item"
            className="input-bordered input-primary input w-full"
          />
          <ErrorMessage error={errors.category?.message} />
          <label className="label">
            <span className="label-text">Manufacturer</span>
          </label>
          <input
            {...register("manufacturer")}
            type="text"
            placeholder="Enter manufacturer"
            className="input-bordered input-primary input w-full"
          />
          <ErrorMessage error={errors.manufacturer?.message} />
          <label className="label">
            <span className="label-text">Model</span>
          </label>
          <input
            {...register(`complectation.model`)}
            type="text"
            placeholder="Enter model name"
            className="input-bordered input-primary input w-full"
          />
          <ErrorMessage error={errors.complectation?.model?.message} />
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <input
            {...register(`complectation.description`)}
            type="text"
            placeholder="Enter description"
            className="input-bordered input-primary input w-full"
          />
          <ErrorMessage error={errors.complectation?.description?.message} />
          <label className="label">
            <span className="label-text">Price</span>
          </label>
          <input
            {...register("complectation.price", {
              setValueAs: (value: string) => parseFloat(value),
            })}
            type="number"
            placeholder="Enter price"
            className="input-bordered input-primary input w-full"
            min={0}
            step={0.01}
          />
          <ErrorMessage error={errors.complectation?.price?.message} />
          <label className="label">
            <span className="label-text">Image URL</span>
          </label>
          <input
            {...register("imageUrl")}
            type="text"
            placeholder="Enter image URL"
            className="input-bordered input-primary input w-full"
          />
          <ErrorMessage error={errors.imageUrl?.message} />
          {createItemMutation.isPending && <Loader />}
          {createItemMutation.isError && (
            <ErrorMessage error={createItemMutation.error.message} />
          )}
        </form>
      </BaseModal>
      <DevTool control={control} />
      <div className="m-12 bg-base-300 p-8">
        <div className="flex flex-col items-end gap-4">
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
          <button
            className="btn-warning btn"
            onClick={() => setOpenCreateItemModal(true)}
          >
            Add one item
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
                <th>Phone</th>
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
                  <td>{user.phone}</td>
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
