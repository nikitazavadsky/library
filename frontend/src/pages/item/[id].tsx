import { useRouter } from "next/router";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth";
import { type RefObject, useEffect, useRef, useState } from "react";
import Loader from "@/components/loader";
import Head from "next/head";
import {
  type InferGetServerSidePropsType,
  type GetServerSideProps,
} from "next";
import useItemQuery from "@/queries/useItem";
import ErrorMessage from "@/components/errorMessage";
import BaseModal from "@/components/baseModal";
import {
  useDeleteItemMutation,
  useEditItemMutation,
} from "@/mutations/useItem";
import {
  type ItemMutateSchema,
  itemMutateSchema,
  type Item,
  itemSchema,
} from "@/schemas/itemSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NO_IMAGE_LINK } from "@/constants/urls";
import ComplectationDropdown from "@/components/complectationDropdown";
import useCartStore from "@/stores/cart";
import {
  useAddComplectation,
  useRemoveComplectation,
} from "@/mutations/useComplectation";
import { DevTool } from "@hookform/devtools";

export const getServerSideProps: GetServerSideProps<{
  itemId: string;
}> = async ({ params }) => {
  return Promise.resolve({ props: { itemId: params?.id as string } });
};

const ItemPage = ({
  itemId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const [isRehydrated, setIsRehydrated] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openAddComplectationModal, setOpenAddComplectationModal] =
    useState(false);
  const [openRemoveComplectationModal, setOpenRemoveComplectationModal] =
    useState(false);

  const isAdmin = useAuthStore((state) => state.isAdmin());
  const [isEditing, setIsEditing] = useState(false);
  const [showError, setShowError] = useState(false);

  // Used for CRUD requests
  const [currentComplectationId, setCurrentComplectationId] =
    useState<number>(0);
  // Used for displaying and editing
  const [currentComplectationIndex, setCurrentComplectationIndex] = useState(0);

  const editItemMutation = useEditItemMutation(Number(itemId));
  const deleteItemMutation = useDeleteItemMutation(Number(itemId));
  const addComplectationMutation = useAddComplectation(Number(itemId));
  const removeComplectationMutation = useRemoveComplectation();

  const handleEdit = () => {
    if (isAdmin) {
      setIsEditing(!isEditing);
    }
  };

  useEffect(() => {
    setIsRehydrated(true);
  }, []);

  const handleSubmitButton = (ref: RefObject<HTMLFormElement>) => {
    ref.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  const {
    register,
    handleSubmit: handleSubmitEdit,
    formState: { errors },
    control, // DevTool only
    reset,
  } = useForm<ItemMutateSchema>({
    resolver: zodResolver(itemMutateSchema),
  });
  const editFormRef = useRef<HTMLFormElement>(null);

  const {
    data: item,
    isLoading,
    isError,
  } = useItemQuery({
    queryKey: ["getItem", itemId],
    onSuccess: (data) => {
      const validData = itemSchema.safeParse(data);
      if (validData.success && validData.data.complectations[0]) {
        setCurrentComplectationIndex(
          validData.data.complectations.findIndex(
            (obj) => obj.id === validData.data.complectations[0]?.id
          )
        );
        setCurrentComplectationId(validData.data.complectations[0].id);
      }
    },
  });

  const {
    register: registerComplectation,
    handleSubmit: handleSubmitComplectation,
    formState: { errors: complectationErrors },
    control: controlComplectation, // DevTool only
  } = useForm<ItemMutateSchema["complectation"]>({
    resolver: zodResolver(itemMutateSchema.shape.complectation),
  });
  const addComplectationFormRef = useRef<HTMLFormElement>(null);

  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (data: Item) => {
    const preparedData = itemSchema.safeParse({
      ...data,
      complectations: [data.complectations[currentComplectationIndex]],
    });
    if (preparedData.success) {
      addToCart(preparedData.data);
    } else {
      setShowError(true);
      console.error(
        "Invalid data:",
        data,
        "with id",
        data.id,
        "Make sure all fields are filled."
      );
    }
  };

  const prepareUpdatedItem = (
    fullItem: Item,
    formData: ItemMutateSchema,
    complectationId: number
  ) => {
    // Clone the full item to prevent modifying the original object
    const updatedItem = JSON.parse(JSON.stringify(fullItem)) as Item;

    // Update the item fields
    updatedItem.category = formData.category;
    updatedItem.imageUrl = formData.imageUrl;
    updatedItem.manufacturer = formData.manufacturer;

    // Find the index of the complectation to update
    const complectationIndex = updatedItem.complectations.findIndex(
      (complectation) => complectation.id === complectationId
    );

    // Update the complectation with the new data
    updatedItem.complectations[complectationIndex] = {
      id: complectationId,
      ...formData.complectation,
    };

    console.warn(
      "I edit complectation id",
      complectationId,
      "with data",
      updatedItem
    );
    return updatedItem;
  };

  const onSuccessEdit = (values: ItemMutateSchema) => {
    console.warn(values);
    if (item) {
      const preparedItem = prepareUpdatedItem(
        item,
        values,
        currentComplectationId
      );
      editItemMutation.mutate(preparedItem);
      setIsEditing(false);
    } else console.error("Item not found");
  };

  const displayEditForm = (
    <form
      ref={editFormRef}
      className="form-control"
      onSubmit={handleSubmitEdit(onSuccessEdit)}
    >
      <label className="label">
        <span className="label-text">Category</span>
      </label>
      <input
        {...register("category")}
        type="text"
        placeholder="Enter category of the item"
        className="input-bordered input-primary input w-full"
        defaultValue={item?.category}
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
        defaultValue={item?.manufacturer}
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
        defaultValue={item?.complectations[currentComplectationIndex]?.model}
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
        defaultValue={
          item?.complectations[currentComplectationIndex]?.description
        }
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
        defaultValue={item?.complectations[currentComplectationIndex]?.price}
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
        defaultValue={item?.imageUrl}
      />
      <ErrorMessage error={errors.imageUrl?.message} />
      {editItemMutation.isPending && <Loader inline />}
      {editItemMutation.isError && (
        <ErrorMessage error={editItemMutation.error.message} />
      )}
    </form>
  );

  useEffect(() => {
    if (item?.complectations.length === 0) {
      void router.push("/home");
    }
  }, [item?.complectations.length, router]);

  useEffect(() => {
    reset();
  }, [currentComplectationIndex, currentComplectationId, reset]);

  if (!item || isError) {
    return <ErrorMessage error="Item not found" />;
  }

  if (router.isFallback || !isRehydrated || isLoading) {
    return <Loader />;
  }

  const displayItem = (
    <div className="flex flex-col">
      <div className="w-full">
        <div className="relative h-96 w-full md:h-auto">
          <Image
            src={
              item.imageUrl != null && item.imageUrl !== ""
                ? item.imageUrl
                : NO_IMAGE_LINK
            }
            alt={item.category}
            width={350}
            height={300}
            className="rounded-lg"
          />
        </div>
      </div>
      <div className="mt-4 w-full md:mt-0 ">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">
          {item.category}{" "}
          {item.complectations[currentComplectationIndex]?.model}
        </h1>
        <ComplectationDropdown
          itemComplectations={item.complectations}
          setIndex={setCurrentComplectationIndex}
          setId={setCurrentComplectationId}
          value={currentComplectationId}
        >
          <label className="label">
            <span className="label-text">Select complectation</span>
          </label>
        </ComplectationDropdown>
        {/* Container with two buttons - add complectation and remove complectation */}
        <div className="flex items-center justify-end gap-4 mt-3">
          <button
            className="btn-primary btn-sm btn"
            onClick={() => setOpenAddComplectationModal(true)}
          >
            Add complectation
          </button>
          {item.complectations.length > 1 && (
            <button
              className="btn-error btn-sm btn"
              onClick={() => {
                setOpenRemoveComplectationModal(true);
                const complectationId =
                  item.complectations[currentComplectationIndex]?.id;
                if (complectationId !== undefined) {
                  setCurrentComplectationId(complectationId);
                }
              }}
            >
              Remove complectation
            </button>
          )}
        </div>
        <table className="mt-4 table w-full">
          <thead>
            <tr>
              <th>Category</th>
              <th>Model</th>
              <th>Manufacturer</th>
              <th>Description</th>
            </tr>
          </thead>
          <tr className="bg-base-100">
            <td>{item.category}</td>
            <td>{item.complectations[currentComplectationIndex]?.model}</td>
            <td>{item.manufacturer}</td>
            <td>
              {item.complectations[currentComplectationIndex]?.description}
            </td>
          </tr>
        </table>
        <p className="my-4 mt-8 flex items-center justify-end gap-4 text-xl font-semibold md:text-2xl">
          {item.complectations[currentComplectationIndex]?.price} BYN
          {!showError ? (
            <button
              className="btn-primary btn"
              onClick={() => {
                handleAddToCart(item);
              }}
            >
              Add to cart
            </button>
          ) : (
            <button
              className="btn-error btn"
              onClick={() => {
                setShowError(false);
              }}
            >
              Error! Check console for details.
            </button>
          )}
        </p>
      </div>
    </div>
  );

  const removeItemModal = (
    <BaseModal
      visible={openDeleteModal}
      closeModal={() => setOpenDeleteModal(false)}
      modalId="remove-item-modal"
      title={`Do you really want to delete this item?`}
      titleClassname="text-2xl font-extrabold uppercase text-warning"
      modalAction={
        <>
          <button
            type="button"
            className="btn-error btn"
            onClick={() => {
              deleteItemMutation.mutate(undefined, {
                onSuccess: () => {
                  setOpenDeleteModal(false);
                  void router.push("/home");
                },
              });
            }}
          >
            Delete item
          </button>
          <button
            type="button"
            className="btn-warning btn"
            onClick={() => setOpenDeleteModal(false)}
          >
            Cancel
          </button>
        </>
      }
    >
      <p>
        This action cannot be undone. Item will be removed from the database.
      </p>
    </BaseModal>
  );

  const removeComplectationModal = (
    <BaseModal
      visible={openRemoveComplectationModal}
      closeModal={() => setOpenRemoveComplectationModal(false)}
      modalId="remove-complectation-modal"
      title={`Do you really want to remove this complectation with id: ${currentComplectationId}?`}
      titleClassname="text-2xl font-extrabold uppercase text-error"
      modalAction={
        <>
          <button
            type="button"
            className="btn-error btn"
            onClick={() => {
              removeComplectationMutation.mutate(currentComplectationId, {
                onSuccess: () => {
                  setOpenRemoveComplectationModal(false);
                },
              });
            }}
          >
            Remove complectation
          </button>
          <button
            type="button"
            className="btn-warning btn"
            onClick={() => setOpenRemoveComplectationModal(false)}
          >
            Cancel
          </button>
        </>
      }
    >
      <p>
        This action cannot be undone. Complectation will be removed from the
        database.
      </p>
    </BaseModal>
  );

  const onSuccessAddComplectation = (
    values: ItemMutateSchema["complectation"]
  ) => {
    if (item) {
      addComplectationMutation.mutate(values);
      setOpenAddComplectationModal(false);
    } else console.error("Item not found");
  };

  const addComplectationModal = (
    <BaseModal
      visible={openAddComplectationModal}
      closeModal={() => setOpenAddComplectationModal(false)}
      modalId="add-complectation-modal"
      title={`Creating complectation for item with id ${item.id}`}
      titleClassname="text-2xl font-extrabold text-success"
      modalAction={
        <>
          <button
            type="button"
            className="btn-success btn"
            onClick={() => {
              handleSubmitButton(addComplectationFormRef);
            }}
          >
            Add new complectation
          </button>
          <button
            type="button"
            className="btn-warning btn"
            onClick={() => setOpenAddComplectationModal(false)}
          >
            Cancel
          </button>
        </>
      }
    >
      <p>
        Add one of the complectation for this item. You can add more
        complectations later or remove them.
      </p>
      <form
        ref={addComplectationFormRef}
        className="form-control"
        onSubmit={handleSubmitComplectation(onSuccessAddComplectation)}
      >
        <label className="label">
          <span className="label-text">Model</span>
        </label>
        <input
          {...registerComplectation(`model`)}
          type="text"
          placeholder="Enter model name"
          className="input-bordered input-primary input w-full"
        />
        <ErrorMessage error={complectationErrors.model?.message} />
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <input
          {...registerComplectation(`description`)}
          type="text"
          placeholder="Enter description"
          className="input-bordered input-primary input w-full"
        />
        <ErrorMessage error={complectationErrors.description?.message} />
        <label className="label">
          <span className="label-text">Price</span>
        </label>
        <input
          {...registerComplectation("price", {
            setValueAs: (value: string) => parseFloat(value),
          })}
          type="number"
          placeholder="Enter price"
          className="input-bordered input-primary input w-full"
          min={0}
          step={0.01}
        />
        <ErrorMessage error={complectationErrors.price?.message} />
        {addComplectationMutation.isPending && <Loader inline />}
        {addComplectationMutation.isError && (
          <ErrorMessage error={addComplectationMutation.error.message} />
        )}
      </form>
    </BaseModal>
  );

  return (
    <>
      <Head>
        <title>
          {item.category}{" "}
          {item.complectations[currentComplectationIndex]?.model}
        </title>
      </Head>
      {removeItemModal}
      {removeComplectationModal}
      {addComplectationModal}
      <div className="mx-auto mt-8 max-w-3xl bg-base-300 p-8">
        {isEditing ? displayEditForm : displayItem}
        <div className="flex justify-end gap-4">
          {isEditing && (
            <button className="btn-warning btn" onClick={handleEdit}>
              Cancel
            </button>
          )}
          {isAdmin && (
            <button
              className="btn-success btn"
              onClick={
                isEditing ? () => handleSubmitButton(editFormRef) : handleEdit
              }
            >
              {isEditing ? "Save" : "Edit Item"}
            </button>
          )}
          {isAdmin && !isEditing && (
            <button
              className="btn-error btn"
              onClick={() => setOpenDeleteModal(true)}
            >
              Delete Item
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemPage;
