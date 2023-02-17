import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { FormError } from "../../components/FormError";

interface ILoginForm {
  nickname: string;
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

  const onSubmit = () => {
    const { nickname } = getValues();
    navigate("/hausle", { state: { nickname } });
  };

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <Helmet>
        <title>Login Hausle</title>
      </Helmet>
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <div className="flex flex-row items-center gap-10">
          <h4 className="title">던전 체험</h4>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 mt-5 px-5 w-full mb-5"
        >
          <input
            {...register("nickname", { required: "닉네임을 입력해주세요." })}
            placeholder="Nickname"
            className="input"
          />
          {errors.nickname?.message && (
            <FormError errorMessage={errors.nickname?.message} />
          )}
          <Button canClick={isValid} loading={false} actionText={"입장하기"} />
        </form>
      </div>
    </div>
  );
};
