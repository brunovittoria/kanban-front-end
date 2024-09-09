import { Draggable } from '@hello-pangea/dnd'

import { useTheme } from '@mui/material/styles'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

import { useBoolean } from '@/hooks/use-boolean'

import { Iconify } from '@/components/iconify'

import KanbanDetails from './kanban-details'

import { bgBlur } from '@/theme/css'

export const KanbanTaskItem = ({ task, index, sx, ...other }) => {
  const theme = useTheme()

  const openDetails = useBoolean()

  const renderPriority = (
    <Iconify
      icon="solar:double-alt-arrow-down-bold-duotone"
      sx={{
        position: 'absolute',
        top: 4,
        right: 4,
        ...(task.priority === 'baixa' && {
          color: 'info.main',
        }),
        ...(task.priority === 'média' && {
          color: 'warning.main',
        }),
        ...(task.priority === 'alta' && {
          color: 'error.main',
        }),
      }}
    />
  )

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={openDetails.onTrue}
            sx={{
              width: 1,
              borderRadius: 1.5,
              overflow: 'hidden',
              position: 'relative',
              bgcolor: 'background.default',
              boxShadow: theme.customShadows.z1,
              '&:hover': {
                boxShadow: theme.customShadows.z20,
              },
              ...(openDetails.value && {
                boxShadow: theme.customShadows.z20,
              }),
              ...(snapshot.isDragging && {
                boxShadow: theme.customShadows.z20,
                ...bgBlur({
                  opacity: 0.48,
                  color: theme.palette.background.default,
                }),
              }),
              ...sx,
            }}
            {...other}
          >
            <Stack spacing={2} sx={{ px: 2, py: 2.5, position: 'relative' }}>
              {renderPriority}

              <Typography variant="subtitle2">{task.name}</Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                  fontSize: 12,
                  maxWidth: 300,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {task.description}
              </Typography>
            </Stack>
          </Paper>
        )}
      </Draggable>

      {openDetails.value && (
        <KanbanDetails
          task={task}
          openDetails={openDetails.value}
          onCloseDetails={openDetails.onFalse}
        />
      )}
    </>
  )
}
