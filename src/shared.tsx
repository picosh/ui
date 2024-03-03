export function Banner({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
export function BannerLoader({
  isLoading,
  isError,
  message,
}: { isLoading?: boolean; isError?: boolean; message: string }) {
  if (isLoading) return null;
  if (!isError) return null;
  return <Banner>{message}</Banner>;
}

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isLoading?: boolean;
}
export function Button({
  children,
  isLoading = false,
  type,
  className,
  ...rest
}: ButtonProps) {
  const cls = `${className}`;
  if (isLoading) {
    return (
      <button {...rest} type={type} className={cls} disabled>
        loading...
      </button>
    );
  }
  return (
    <button {...rest} type={type} className={cls}>
      {children}
    </button>
  );
}
