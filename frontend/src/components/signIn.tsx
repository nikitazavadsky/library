import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SignInFields, signInSchemaWithEmail } from "@/schemas/authSchema";
import ErrorMessage from "./errorMessage";
import { useState } from "react";
import useSignInMutation from "@/mutations/useSignIn";
import Loader from "./loader";

interface Props {
  children?: React.ReactNode;
  showSuccessMessage: () => void;
}

export default function SignIn({ children, showSuccessMessage }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFields>({
    resolver: zodResolver(signInSchemaWithEmail),
  });

  const handleSuccess = () => {
    setIsModalOpen(false);
    showSuccessMessage();
  };

  const signInMutation = useSignInMutation(handleSuccess);

  return (
    <>
      <label
        htmlFor="sign-in-modal"
        className="btn-accent btn rounded-md border border-transparent normal-case  hover:bg-opacity-75"
      >
        Sign in
      </label>
      <input
        type="checkbox"
        id="sign-in-modal"
        className="modal-toggle"
        onChange={() => setIsModalOpen(!isModalOpen)}
        checked={isModalOpen}
      />
      <label htmlFor="sign-in-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          <form
            className="form-control"
            onSubmit={handleSubmit((values) => {
              signInMutation.mutate(values);
            })}
          >
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              {...register("email")}
              type="text"
              placeholder="Enter your email"
              className="input-bordered input-primary input w-full"
            />
            <ErrorMessage error={errors.email?.message} />
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Enter your password"
              className="input-bordered input-primary input w-full"
            />
            <ErrorMessage error={errors.password?.message} />
            {signInMutation.isPending && <Loader inline />}
            {signInMutation.isError && (
              <ErrorMessage error={signInMutation.error.message} />
            )}
            {children}
            <div className="modal-action">
              <button
                className="btn-accent btn normal-case"
                type="submit"
                disabled={signInMutation.isPending}
              >
                Log In
              </button>
            </div>
          </form>
        </label>
      </label>
    </>
  );
}
