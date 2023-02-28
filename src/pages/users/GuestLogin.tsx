import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { FormError } from "../../components/FormError";

interface IGuestLoginForm {
  nickname: string;
}

export const GuestLogin = () => {
  const navigate = useNavigate();
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IGuestLoginForm>({
    mode: "onChange",
  });

  const onSubmit = () => {
    const { nickname } = getValues();
    navigate("/dungeon", { state: { nickname } });
  };

  return (
    <main>
      <Helmet>
        <title>Guest Login | Dungeon</title>
      </Helmet>
      <section className="absolute w-full h-full">
        <div className="absolute top-0 w-full h-full bg-gray-900 panel-background-image"></div>
        <div className="container mx-auto px-4 h-full">
          <div className="flex content-center items-center justify-center h-full">
            <div className="w-full lg:w-4/12 px-4">
              <div className="panel">
                <div className="rounded-t mb-0 px-6 py-6">
                  <div className="text-gray-500 text-center mb-3 font-bold">
                    <small>Guest Login</small>
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
                      loading={false}
                      actionText={"Geust Login"}
                    />
                  </form>
                </div>
              </div>

              <div className="flex flex-wrap mt-6 relative">
                <div className="w-1/2">
                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                    className="text-gray-500"
                  >
                    <small>Go to login</small>
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
