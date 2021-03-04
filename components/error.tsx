import { main } from "../i18n";

const ErrorPage = (props: { message?: string }) => (
    <div>{(props && props.message) || main.generalErrorMessage}</div>
);

export default ErrorPage;
