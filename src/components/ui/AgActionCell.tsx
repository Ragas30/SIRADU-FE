// components/ui/AgActionCell.tsx
import { Button, Menu, MenuItem, MenuRoot, Portal } from "@chakra-ui/react";
import { Info, MoreVertical, Pencil, Trash } from "lucide-react";
import { BsThreeDotsVertical } from "react-icons/bs";

type Props = {
  data: any;
  onEdit?: (row: any) => void;
  onDetail?: (row: any) => void;
  onDelete?: (row: any) => void;
  icon?: React.ReactNode;
};

export function AgActionCell({
  data,
  onEdit,
  onDetail,
  onDelete,
  icon,
}: Props) {
  return (
    <MenuRoot>
      <Menu.Trigger asChild>
        <Button as={Button} size="sm" variant="ghost" aria-label="Options">
          {icon ?? <MoreVertical size={16} />}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="edit" onClick={() => onEdit?.(data)}>
              <Pencil size={14} style={{ marginRight: 6 }} /> Edit
            </Menu.Item>
            <Menu.Item value="detail" onClick={() => onDetail?.(data)}>
              <Info size={14} style={{ marginRight: 6 }} /> Detail
            </Menu.Item>
            <Menu.Item value="delete" onClick={() => onDelete?.(data)}>
              <Trash size={14} style={{ marginRight: 6 }} /> Hapus
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </MenuRoot>
  );
}
