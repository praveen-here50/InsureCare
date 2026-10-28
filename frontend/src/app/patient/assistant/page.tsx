import { getPortal } from "../portal";
import AssistantChat from "./AssistantChat";

export default async function AssistantPage() {
  const { member } = await getPortal();
  return <AssistantChat firstName={member.firstName} />;
}
