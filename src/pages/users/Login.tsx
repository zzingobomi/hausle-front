import { gql, useMutation } from "@apollo/client";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { FormError } from "../../components/FormError";
import { LOCALSTORAGE_TOKEN } from "../../constants";
import { authTokenVar, isLoggedInVar } from "../../apollo";
import {
  loginMutation,
  loginMutationVariables,
} from "../../__generated__/loginMutation";

const LOGIN_MUTATION = gql`
  mutation loginMutation($loginInput: LoginInput!) {
    login(input: $loginInput) {
      ok
      token
      error
    }
  }
`;

interface ILoginForm {
  email: string;
  password: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ILoginForm>({
    mode: "onChange",
  });

  const onCompleted = (data: loginMutation) => {
    const {
      login: { ok, token },
    } = data;
    if (ok && token) {
      localStorage.setItem(LOCALSTORAGE_TOKEN, token);
      authTokenVar(token);
      isLoggedInVar(true);
      navigate("/dungeon");
    }
  };

  const [loginMutation, { data: loginMutationResult, loading }] = useMutation<
    loginMutation,
    loginMutationVariables
  >(LOGIN_MUTATION, {
    onCompleted,
  });

  const onSubmit = () => {
    if (!loading) {
      const { email, password } = getValues();
      loginMutation({
        variables: {
          loginInput: {
            email,
            password,
          },
        },
      });
    }
  };

  return (
    <main>
      <Helmet>
        <title>Login | Dungeon</title>
      </Helmet>
      <section className="absolute w-full h-full">
        <div className="panel-background panel-background-image"></div>
        <div className="container mx-auto px-4 h-full">
          <div className="flex content-center items-center justify-center h-full">
            <div className="w-full lg:w-4/12 px-4">
              <div className="panel">
                <div className="rounded-t mb-0 px-6 py-6">
                  <div className="text-center mb-3">
                    <h6 className="text-gray-600 text-sm font-bold">
                      Sign in with
                    </h6>
                  </div>
                  <div className="btn-wrapper text-center">
                    <button
                      className="panel-social mr-2 "
                      type="button"
                      style={{ transition: "all .15s ease" }}
                    >
                      <img
                        alt="..."
                        className="w-5 mr-1"
                        src={"/img/github.svg"}
                      />
                      Github
                    </button>
                    <button
                      className="panel-social mr-1"
                      type="button"
                      style={{ transition: "all .15s ease" }}
                    >
                      <img
                        alt="..."
                        className="w-5 mr-1"
                        src={"/img/google.svg"}
                      />
                      Google
                    </button>
                  </div>
                  <hr className="mt-6 border-b-1 border-gray-400" />
                </div>
                <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                  <div className="text-gray-500 text-center mb-3 font-bold">
                    <small>Or sign in with Email</small>
                  </div>
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
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          id="customCheckLogin"
                          type="checkbox"
                          className="form-checkbox border-0 rounded text-gray-800 ml-1 w-5 h-5"
                          style={{ transition: "all .15s ease" }}
                        />
                        <span className="ml-2 text-sm font-semibold text-gray-700">
                          Remember me
                        </span>
                      </label>
                    </div>

                    <Button
                      canClick={isValid}
                      loading={loading}
                      actionText={"Sign In"}
                    />
                    {loginMutationResult?.login.error && (
                      <FormError
                        errorMessage={loginMutationResult.login.error}
                      />
                    )}
                  </form>
                </div>
              </div>

              <div className="flex flex-wrap mt-6 relative">
                <div className="w-1/2">
                  <a
                    href="/guest-login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/guest-login");
                    }}
                    className="text-gray-500"
                  >
                    <small>Guest login</small>
                  </a>
                </div>
                <div className="w-1/2 text-right">
                  <a
                    href="/create-account"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/create-account");
                    }}
                    className="text-yellow-500"
                  >
                    <small>Create new account</small>
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
