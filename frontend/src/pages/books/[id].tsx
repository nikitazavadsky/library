import { useRouter } from "next/router";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth";
import { useEffect, useRef, useState } from "react";
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
import { type ItemFields, itemSchema, type Item } from "@/schemas/itemSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NO_IMAGE_LINK } from "@/components/itemCard";
import useCartStore from "@/stores/cart";
import { checkTruthy } from "@/utils/objectHelpers";
import { MultiSelect } from "@mantine/core";
import { type Filters } from "@/queries/useFilters";

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

  const [authors, setAuthors] = useState<{ value: string; label: string }[]>(
    []
  );
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);

  const isAdmin = useAuthStore((state) => state.isAdmin());
  const [isEditing, setIsEditing] = useState(false);

  const { data: item, isLoading, isError } = useItemQuery(itemId);
  const editItemMutation = useEditItemMutation(Number(itemId));
  const deleteItemMutation = useDeleteItemMutation(Number(itemId));

  const onSuccessQuery = (filterData: Filters) => {
    const { authors } = filterData;

    const authorsToSet = authors.map((author) => ({
      value: author.id,
      label: `${author.first_name} ${author.last_name}`,
    }));

    const selectedAuthorsToSet = item?.authors.map((author) => ({
      value: author.id,
      label: `${author.first_name} ${author.last_name}`,
    }));

    setAuthors(authorsToSet);
    setSelectedAuthors(selectedAuthorsToSet);
  };

  const handleEdit = () => {
    if (isAdmin) {
      setIsEditing(!isEditing);
    }
  };

  useEffect(() => {
    setIsRehydrated(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFields>({
    resolver: zodResolver(itemSchema.omit({ id: true })),
  });
  const formRef = useRef<HTMLFormElement>(null);

  const onSuccessEdit = (values: ItemFields) => {
    editItemMutation.mutate(values);
    setIsEditing(false);
  };

  const handleSave = () => {
    formRef.current?.dispatchEvent(
      new Event("submit", { cancelable: true, bubbles: true })
    );
  };

  const addToCart = useCartStore((state) => state.addItem);

  const handleDataSubmit = (data: Item) => {
    const validData = checkTruthy(data);

    if (validData !== null) {
      addToCart(validData);
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

  const displayEditForm = (
    <form
      ref={formRef}
      className="form-control"
      onSubmit={handleSubmit(onSuccessEdit)}
    >
      <label className="label">
        <span className="label-text">Book title</span>
      </label>
      <input
        {...register("title")}
        type="text"
        placeholder="Enter book title"
        className="input-bordered input-primary input w-full"
        defaultValue={item?.title}
      />
      <ErrorMessage error={errors.title?.message} />
      <label className="label">
        <span className="label-text">ISBN</span>
      </label>
      <input
        {...register("isbn")}
        type="text"
        placeholder="Enter book' ISBN"
        className="input-bordered input-primary input w-full"
        defaultValue={item?.isbn}
      />
      <ErrorMessage error={errors.isbn?.message} />
      <label className="label">
        <span className="label-text">Pages</span>
      </label>
      <input
        {...register("num_pages", {
          setValueAs: (value: string) => parseInt(value),
        })}
        type="text"
        placeholder="Enter number of pages"
        className="input-bordered input-primary input w-full"
        defaultValue={item?.num_pages}
      />
      <ErrorMessage error={errors.num_pages?.message} />
      <label className="label">
        <span className="label-text">Authors</span>
      </label>
      <MultiSelect
        {...register("authors")}
        placeholder="Pick one or more"
        searchable
        nothingFound="No options"
        data={authors}
        onChange={(value) => {
          setSelectedAuthors(value);
        }}
      />
      <ErrorMessage error={errors.num_pages?.message} />
      <label className="label">
        <span className="label-text">Image URL</span>
      </label>
      <input
        {...register("image_url")}
        type="text"
        placeholder="Enter image url"
        className="input-bordered input-primary input w-full"
        defaultValue={item?.image_url ? item?.image_url : NO_IMAGE_LINK}
      />
      <ErrorMessage error={errors.image_url?.message} />
      {editItemMutation.isPending && <Loader />}
      {editItemMutation.isError && (
        <ErrorMessage error={editItemMutation.error.message} />
      )}
    </form>
  );

  if (!item || isError) {
    return <ErrorMessage error="Book not found" />;
  }

  const displayItem = (
    <div className="flex flex-col">
      <div className="w-full ">
        <div className="relative h-96 w-full md:h-auto">
          <Image
            src={item.image_url ? item.image_url : NO_IMAGE_LINK}
            alt={item.title}
            width={350}
            height={300}
            className="rounded-lg"
          />
        </div>
      </div>
      <div className="mt-4 w-full md:mt-0 ">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">{item.title}</h1>
        <table className="table w-full">
          <thead>
            <tr>
              <th>Pages</th>
              <th>ISBN</th>
              <th>Authors</th>
            </tr>
          </thead>
          <tr className="bg-base-100">
            <td>{item.num_pages}</td>
            <td>{item.isbn}</td>
            <td>
              {item.authors.map((author, index) => {
                const authorName = `${author.first_name} ${author.last_name}`;
                const isLastAuthor = index === item.authors.length - 1;
                return isLastAuthor ? authorName : `${authorName}, `;
              })}
            </td>
          </tr>
        </table>
        <p className="my-4 flex items-center justify-end text-xl font-semibold md:text-2xl">
          <button
            className="btn-info btn ml-8"
            onClick={() => {
              handleDataSubmit(item);
            }}
          >
            Add to Wishlist
          </button>
        </p>
      </div>
    </div>
  );

  if (router.isFallback || !isRehydrated || isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>{item.title}</title>
      </Head>
      <BaseModal
        visible={openDeleteModal}
        closeModal={() => setOpenDeleteModal(!openDeleteModal)}
        modalId="remove-user-modal"
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
      <div className="mx-auto mt-8 max-w-3xl bg-base-300 p-8">
        {isEditing ? displayEditForm : displayItem}
        <div className="mt-4 flex justify-end gap-4">
          {isEditing && (
            <button className="btn-warning btn" onClick={handleEdit}>
              Cancel
            </button>
          )}
          {isAdmin && (
            <button
              className="btn-success btn"
              onClick={isEditing ? handleSave : handleEdit}
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
