interface IFormErrorProps {
  errorMessage: string;
}

export const FormError: React.FC<IFormErrorProps> = ({ errorMessage }) => (
  <small className="font-medium text-red-500 mt-1">{errorMessage}</small>
);
