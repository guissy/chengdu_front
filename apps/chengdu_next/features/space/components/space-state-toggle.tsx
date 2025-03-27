import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {Button} from "chengdu_ui";
import client from '@/lib/api/client';
import {  SpaceState } from '@prisma/client';
import { SpaceListResponseSchema } from '@/lib/schema/space';
import { z } from 'zod';

type Space = NonNullable<z.infer<typeof SpaceListResponseSchema>['data']>['list'][number];

interface SpaceStateToggleProps {
  space: Space;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spaceStateLabels: Record<SpaceState, string> = {
  ENABLED: '启用',
  DISABLED: '禁用',
};

export default function SpaceStateToggle({
  space,
  variant = 'button',
  size = 'md',
  className = ''
}: SpaceStateToggleProps) {
  const queryClient = useQueryClient();

  const { mutate: updateSpaceState } = useMutation({
    mutationFn: (data: any) =>
      client.POST("/api/space/update", { body: data.body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["space", space.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["spaces"],
      });
      toast.success(`广告位状态已更新为${spaceStateLabels[space.state === SpaceState.ENABLED ? SpaceState.DISABLED : SpaceState.ENABLED]}`);
    },
    onError: (err) => {
      toast.error('更新状态失败');
      console.error(err);
    }
  });

  const handleStateChange = async () => {
    const newState = space.state === SpaceState.ENABLED ? SpaceState.DISABLED : SpaceState.ENABLED;
    await updateSpaceState({
      body: {
        ...space,
        id: space.id,
        state: newState,
      }
    });
    queryClient.invalidateQueries({
      queryKey: ["space", space.id],
    });
    queryClient.invalidateQueries({
      queryKey: ["spaceList"],
    });
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size={size}
        icon={space.state === SpaceState.ENABLED ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        onClick={(e) => {
          e.stopPropagation();
          handleStateChange();
        }}
        className={className}
      >
        {space.state === SpaceState.ENABLED ? '禁用' : '启用'}
      </Button>
    );
  }

  return (
    <button
      className={`btn ${space.state === SpaceState.ENABLED ? 'btn-error' : 'btn-success'} btn-block ${className}`}
      onClick={() => handleStateChange()}
    >
      {space.state === SpaceState.ENABLED ? '禁用广告位' : '启用广告位'}
    </button>
  );
}
