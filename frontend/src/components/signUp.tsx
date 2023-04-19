import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUpFields, signUpSchema } from "@/schemas/authSchema";
import ErrorMessage from "./errorMessage";
import { useState } from "react";
import useSignUpMutation from "@/mutations/useSignUp";
import Loader from "./loader";

export default function SignUp({ children }: { children?: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFields>({
    resolver: zodResolver(signUpSchema),
  });

  const signUpMutation = useSignUpMutation(() => setIsModalOpen(false));

  return (
    <>
      <label
        htmlFor="sign-up-modal"
        className="btn-secondary btn ml-5 rounded-md border border-transparent normal-case"
      >
        Sign up
      </label>
      <input
        type="checkbox"
        id="sign-up-modal"
        className="modal-toggle"
        onChange={() => setIsModalOpen(!isModalOpen)}
        checked={isModalOpen}
      />
      <label htmlFor="sign-up-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          <form
            className="form-control"
            onSubmit={handleSubmit((values) => {
              signUpMutation.mutate(values);
            })}
          >
            <label className="label">
              <span className="label-text">First name</span>
            </label>
            <input
              {...register("firstName")}
              type="text"
              placeholder="Enter your first name"
              className="input-bordered input-primary input w-full"
            />
            <ErrorMessage error={errors.firstName?.message} />
            <label className="label">
              <span className="label-text">Last name</span>
            </label>
            <input
              {...register("lastName")}
              type="text"
              placeholder="Enter your last name"
              className="input-bordered input-primary input w-full"
            />
            <ErrorMessage error={errors.lastName?.message} />
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
            <label className="label">
              <span className="label-text">Repeat password</span>
            </label>
            <input
              {...register("repeatPassword")}
              type="password"
              placeholder="Repeat your password"
              className="input-bordered input-primary input w-full"
            />
            <ErrorMessage error={errors.repeatPassword?.message} />
            {signUpMutation.isPending && <Loader inline />}
            {signUpMutation.isError && (
              <ErrorMessage error={signUpMutation.error.message} />
            )}
            {children}
            <div className="modal-action">
              <button type="submit" className="btn-accent btn normal-case">
                Register
              </button>
            </div>
          </form>
        </label>
      </label>
    </>
  );
}
