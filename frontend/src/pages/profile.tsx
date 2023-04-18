import ErrorMessage from "@/components/errorMessage";
import Loader from "@/components/loader";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { useUserQuery } from "@/queries/useUser";
import Head from "next/head";
import { env } from "@/env.mjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type ProfileEditSchema,
  profileEditSchema,
} from "@/schemas/profileSchema";
import useEditProfileMutation from "@/mutations/useEditProfile";
import withAuth from "@/stores/withAuth";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const [isRehydrated, setIsRehydrated] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileEditSchema>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
    },
  });

  // TODO: Specify return type
  const editProfileMutation = useEditProfileMutation<
    ProfileEditSchema,
    { success: boolean }
  >();

  useEffect(() => {
    setIsRehydrated(true);
  }, []);

  const [showEditForm, setShowEditForm] = useState<boolean>(false);

  const { isLoading, isError, error } = useUserQuery(user?.id);

  if (isLoading || !isRehydrated) return <Loader />;

  if (isError) return <ErrorMessage error={error.message} />;

  return (
    <>
      <Head>
        <title>My Profile</title>
      </Head>
      <div className="flex min-h-screen flex-col py-2">
        <main className="flex w-full justify-center p-6">
          <h1 className="text-6xl font-bold">Your Profile</h1>
        </main>
        <div className="flex w-full flex-col items-center justify-center">
          {showEditForm ? (
            <div className="flex flex-col">
              <form
                className="form-control"
                onSubmit={handleSubmit((values) => {
                  editProfileMutation.mutate(values, {
                    onSuccess: () => {
                      setShowEditForm(false);
                    },
                  });
                })}
              >
                <label className="input-group">
                  <span className="flex-1">First Name</span>
                  <input
                    {...register("firstName")}
                    type="text"
                    placeholder="John"
                    className="input-bordered input"
                  />
                  <ErrorMessage error={errors.firstName?.message} />
                </label>
                <label className="input-group">
                  <span className="flex-1">Last Name</span>
                  <input
                    {...register("lastName")}
                    type="text"
                    placeholder="Doe"
                    className="input-bordered input"
                  />
                  <ErrorMessage error={errors.lastName?.message} />
                </label>
                <label className="input-group">
                  <span className="flex-1">Email</span>
                  <input
                    {...register("email")}
                    type="text"
                    placeholder="info@site.com"
                    className="input-bordered input"
                  />
                  <ErrorMessage error={errors.email?.message} />
                </label>
                <button
                  type="submit"
                  className="btn-success btn self-end rounded px-4 py-2 font-bold"
                >
                  Save
                </button>
              </form>
              {editProfileMutation.isError && (
                <ErrorMessage error={editProfileMutation.error.message} />
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <p className="text-2xl font-bold">
                Full Name:{" "}
                {`${user?.firstName ?? "Missing firstName"} ${
                  user?.lastName ?? "Missing lastName"
                }`}
              </p>
              <p className="text-2xl font-bold">Email: {user?.email}</p>
              {env.NEXT_PUBLIC_CLIENT_MODE === "development" && (
                <p className="text-2xl font-bold">Role: {user?.role}</p>
              )}
              <button
                className="btn-info btn self-end rounded px-4 py-2 font-bold text-white"
                onClick={() => setShowEditForm(true)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(Profile);
