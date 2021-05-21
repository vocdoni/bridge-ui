import { GrayRectangle } from "./Banners/styled";
import { Spinner } from "./spinner";

export const LoadingRectangle = ({ message }: { message: string }) => (
  <GrayRectangle>
    <div>
      <span>{message} &nbsp;</span>
      <Spinner />
    </div>
  </GrayRectangle>
);
