import React from 'react';
import { StacApiProvider } from '../context';

type WrapperType = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperType) => (
  <StacApiProvider apiUrl="https://fake-stac-api.net">{children}</StacApiProvider>
);
export default Wrapper;
