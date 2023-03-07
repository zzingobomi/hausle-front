import { gql, useMutation } from "@apollo/client";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { FormError } from "../../components/FormError";
import {
  createAccountMutation,
  createAccountMutationVariables,
} from "../../__generated__/createAccountMutation";

const CREATE_ACCOUNT_MUTATION = gql`
  mutation createAccountMutation($createAccountInput: CreateAccountInput!) {
    createAccount(input: $createAccountInput) {
      ok
      error
    }
  }
`;

interface ICreateAccountForm {
  email: string;
  password: string;
  nickname: string;
}

export const CreateAccount = () => {
  const navigate = useNavigate();
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ICreateAccountForm>({
    mode: "onChange",
  });

  const onCompleted = (data: createAccountMutation) => {
    const {
      createAccount: { ok },
    } = data;
    if (ok) {
      alert("계정이 만들어졌습니다. 로그인해 주세요.");
      navigate("/login");
    }
  };

  const [
    createAccountMutation,
    { loading, data: createAccountMutationResult },
  ] = useMutation<createAccountMutation, createAccountMutationVariables>(
    CREATE_ACCOUNT_MUTATION,
    {
      onCompleted,
    }
  );

  const onSubmit = () => {
    if (!loading) {
      const { email, password, nickname } = getValues();
      createAccountMutation({
        variables: {
          createAccountInput: { email, password, nickname },
        },
      });
    }
  };

  return (
    <main>
      <Helmet>
        <title>Create Account | Dungeon</title>
      </Helmet>
      <section className="absolute w-full h-full">
        <div className="absolute top-0 w-full h-full bg-gray-900 panel-background-image"></div>
        <div className="container mx-auto px-4 h-full">
          <div className="flex content-center items-center justify-center h-full">
            <div className="w-full lg:w-4/12 px-4">
              <div className="panel">
                <div className="rounded-t mb-0 px-6 py-6">
                  <div className="text-gray-500 text-center mb-3 font-bold">
                    <small>Create Account</small>
                  </div>
                  <hr className="mt-6 border-b-1 border-gray-400" />
                </div>
                <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="relative w-full mb-3">
                      <label
                        className="panel-input-title"
                        htmlFor="grid-password"
                      >
                        Email
                      </label>
                      <input
                        {...register("email", {
                          required: "이메일을 입력해 주세요.",
                          pattern:
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        })}
                        type="email"
                        className="panel-input"
                        placeholder="Email"
                        style={{ transition: "all .15s ease" }}
                      />
                      {errors.email?.message && (
                        <FormError errorMessage={errors.email?.message} />
                      )}
                      {errors.email?.type === "pattern" && (
                        <FormError
                          errorMessage={"정확한 이메일을 입력해 주세요."}
                        />
                      )}
                    </div>

                    <div className="relative w-full mb-3">
                      <label
                        className="panel-input-title"
                        htmlFor="grid-password"
                      >
                        Password
                      </label>
                      <input
                        {...register("password", {
                          required: "비밀번호를 입력해 주세요.",
                        })}
                        type="password"
                        className="panel-input"
                        placeholder="Password"
                        style={{ transition: "all .15s ease" }}
                      />
                      {errors.password?.message && (
                        <FormError errorMessage={errors.password?.message} />
                      )}
                    </div>

                    <div className="relative w-full mb-3">
                      <label
                        className="panel-input-title"
                        htmlFor="grid-password"
                      >
                        Nickname
                      </label>
                      <input
                        {...register("nickname", {
                          required: "닉네임을 입력해주세요.",
                        })}
                        type="text"
                        className="panel-input"
                        placeholder="Nickname"
                        style={{ transition: "all .15s ease" }}
                      />
                      {errors.nickname?.message && (
                        <FormError errorMessage={errors.nickname?.message} />
                      )}
                    </div>

                    <Button
                      canClick={isValid}
                      loading={loading}
                      actionText={"Create Account"}
                    />
                  </form>
                </div>
              </div>

              <div className="flex flex-wrap mt-6 relative">
                <div className="w-1/2"></div>
                <div className="w-1/2 text-right">
                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                    className="text-gray-500"
                  >
                    <small>Go to Login</small>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
