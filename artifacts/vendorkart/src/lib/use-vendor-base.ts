import { useGetVendorProfile } from '@workspace/api-client-react';

export function useVendorBase() {
  const { data: vendor } = useGetVendorProfile() as { data: any };
  const slug = vendor?.slug as string | undefined;
  return {
    base: slug ? `/vendor/${slug}` : '/vendor-dashboard',
    slug,
  };
}
