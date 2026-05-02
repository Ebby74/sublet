import { type FC, type LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: FC<LabelProps> = ({ className, children, ...props }) => (
  <label className={className} {...props}>
    {children}
  </label>
);