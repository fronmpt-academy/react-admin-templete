export { ClientStatusChip } from './ui/status-chip';
export { clientFormSchema, emptyClientFormValues } from './model/schema';
export {
  listClients,
  createClient,
  deleteClient,
  updateClient,
} from './api/repository';
export {
  clientsKey,
  useClients,
  useCreateClient,
  useDeleteClient,
  useUpdateClient,
} from './api/queries';
export type { ClientFormValues } from './model/schema';
export type { Client, ClientDoc, ClientInput, ClientStatus } from './model/types';
