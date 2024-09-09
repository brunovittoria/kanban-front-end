import { useState, MouseEvent, useEffect } from 'react'

import { Box, Button, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { ConfirmDialog } from '@/components/custom-dialog'

import { useBoolean } from '@/hooks/use-boolean'

import { axios } from '@/utils/axios'

import { endpoints } from '@/constants/config'

import { enqueueSnackbar } from 'notistack'

import { handleTouchStart } from './shared/handleTouchStart'
import { UpdateBoard } from './board-update'
import { mutate } from 'swr'
import { Iconify } from '@/components/iconify'
import { useRequestSWR } from '@/hooks/use-request'


export const BoardActions = ({ setSelectedBoard, selectedBoard, board }) => {
  const confirmDialogDelete = useBoolean()
  const dialogEdit = useBoolean()

  const { data: columns } = useRequestSWR({
    url: endpoints.columns.getAllColumns,
  })

  const [anchorEl, setAnchorEl] = useState(null)
  const [lastTap, setLastTap] = useState(0)

  const handleMouseDown = (event) => {
    switch (event.button) {
      case 0:
        setSelectedBoard(board.id)
        break
      case 2:
        setAnchorEl(event.currentTarget)
        break
    }
  }

  const handleClose = () => setAnchorEl(null)

  const deleteBoardData = async (board) => {
    const columnDeletionPromises = board.columnIds.map(async (columnId) => {
      columns?.map(async (column) => {
        if (column.id === columnId) await axios.delete(endpoints.tasks.updateTask(columnId))
      })

      await axios.delete(endpoints.columns.updateColumn(columnId))
    })

    await Promise.all(columnDeletionPromises).then(() => {
      mutate(endpoints.columns.getAllColumns)
      mutate(endpoints.tasks.getAllTasks)
    })

    await axios.delete(endpoints.boards.updateBoard(board.id)).then(() => {
      enqueueSnackbar('Quadro deletado com sucesso')
      setSelectedBoard(null)

      mutate(endpoints.boards.getAllBoards)
      confirmDialogDelete.onFalse()
    })
  }

  const handleContextMenu = (event) => event.preventDefault()

  // Prevent context menu default on touch devices
  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener(
      'touchstart',
      (event) => handleTouchStart(lastTap, setLastTap, setAnchorEl, event),
      { passive: false }
    )

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('touchstart', (event) =>
        handleTouchStart(lastTap, setLastTap, setAnchorEl, event)
      )
    }
  }, [lastTap])

  return (
    <>
      <Button
        variant="soft"
        onMouseDown={handleMouseDown}
        onContextMenu={(event) => event.preventDefault()}
        sx={{
          minWidth: '150px',
          border: '1px solid',
          borderColor: selectedBoard === board.id ? 'text.secondary' : 'transparent',
        }}
      >
        {board.name}
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            dialogEdit.onTrue()
            handleClose()
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:pencil" />

            <Typography variant="body2">Editar</Typography>
          </Stack>
        </MenuItem>

        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            confirmDialogDelete.onTrue()
            handleClose()
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="tabler:trash-filled" />

            <Typography variant="body2">Deletar</Typography>
          </Stack>
        </MenuItem>
      </Menu>

      {dialogEdit.value && <UpdateBoard board={board} dialogEdit={dialogEdit} />}

      <ConfirmDialog
        open={confirmDialogDelete.value}
        onClose={confirmDialogDelete.onFalse}
        title="Deletar"
        content={
          <>
            Você quer mesmo deletar o quadro?
            <Box sx={{ typography: 'caption', color: 'error.main', mt: 2 }}>
              <strong>Aviso: </strong> Todos as colunas e tasks relacionados a este quadro também
              serão deletados.
            </Box>
          </>
        }
        action={
          <Button variant="outlined" color="error" onClick={() => deleteBoardData(board)}>
            Deletar
          </Button>
        }
      />
    </>
  )
}
