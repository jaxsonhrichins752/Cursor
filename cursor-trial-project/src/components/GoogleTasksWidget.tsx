import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import {
  createTask,
  deleteTask,
  fetchTasks,
  type GoogleTask,
  updateTask,
} from '../lib/googleTasks'

type GoogleTasksWidgetProps = {
  accessToken: string | null
}

export function GoogleTasksWidget({ accessToken }: GoogleTasksWidgetProps) {
  const [tasks, setTasks] = useState<GoogleTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTask, setNewTask] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  const refreshTasks = () => {
    if (!accessToken) {
      setTasks([])
      setError('Sign in with Google to load tasks.')
      return
    }

    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const result = await fetchTasks(accessToken)
        setTasks(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load tasks.')
      } finally {
        setLoading(false)
      }
    })()
  }

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (!accessToken) {
        setTasks([])
        setError('Sign in with Google to load tasks.')
        return
      }

      setLoading(true)
      setError(null)
      try {
        const result = await fetchTasks(accessToken)
        if (!cancelled) {
          setTasks(result)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load tasks.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accessToken])

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accessToken || !newTask.trim()) {
      return
    }

    setLoading(true)
    setError(null)
    void (async () => {
      try {
        await createTask(accessToken, newTask)
        setNewTask('')
        const result = await fetchTasks(accessToken)
        setTasks(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not add task.')
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleToggleTask = (task: GoogleTask) => {
    if (!accessToken) {
      return
    }

    setLoading(true)
    setError(null)
    void (async () => {
      try {
        await updateTask(accessToken, {
          id: task.id,
          completed: !task.completed,
        })
        const result = await fetchTasks(accessToken)
        setTasks(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not update task.')
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleDeleteTask = (taskId: string) => {
    if (!accessToken) {
      return
    }

    setLoading(true)
    setError(null)
    void (async () => {
      try {
        await deleteTask(accessToken, taskId)
        const result = await fetchTasks(accessToken)
        setTasks(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not delete task.')
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleSaveEdit = (taskId: string) => {
    if (!accessToken || !editingText.trim()) {
      return
    }

    setLoading(true)
    setError(null)
    void (async () => {
      try {
        await updateTask(accessToken, {
          id: taskId,
          title: editingText,
        })
        setEditingId(null)
        setEditingText('')
        const result = await fetchTasks(accessToken)
        setTasks(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save task.')
      } finally {
        setLoading(false)
      }
    })()
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
            mb: 2,
          }}
        >
          <Typography variant="h6">To-do List</Typography>
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={loading || !accessToken}
            onClick={refreshTasks}
            startIcon={<RefreshRoundedIcon />}
          >
            Refresh
          </Button>
        </Box>

        <Box
          component="form"
          onSubmit={handleAddTask}
          sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            label="Add a task"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            disabled={!accessToken || loading}
          />
          <Button type="submit" variant="contained" disabled={!accessToken || loading}>
            Add
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Syncing tasks...
            </Typography>
          </Box>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
            {error}
          </Typography>
        )}

        {!accessToken && (
          <Box
            sx={{
              border: '1px dashed #d7dde1',
              borderRadius: 2,
              p: 2,
              mb: 2,
              textAlign: 'center',
              bgcolor: '#fbfcfc',
            }}
          >
            <TaskAltRoundedIcon sx={{ color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Connect your Google account to sync tasks.
            </Typography>
            <Button disabled variant="outlined" size="small">
              Connect Google Account
            </Button>
          </Box>
        )}

        <List sx={{ py: 0 }}>
          {!loading && tasks.length === 0 && !error && (
            <Typography variant="body2" color="text.secondary">
              No tasks yet.
            </Typography>
          )}
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              disablePadding
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  {editingId === task.id ? (
                    <>
                      <IconButton edge="end" onClick={() => handleSaveEdit(task.id)} disabled={loading}>
                        <SaveRoundedIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setEditingId(null)
                          setEditingText('')
                        }}
                        disabled={loading}
                      >
                        <CloseRoundedIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setEditingId(task.id)
                          setEditingText(task.title)
                        }}
                        disabled={loading}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteTask(task.id)} disabled={loading}>
                        <DeleteRoundedIcon />
                      </IconButton>
                    </>
                  )}
                </Stack>
              }
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task)}
                  disabled={loading}
                />
              </ListItemIcon>
              {editingId === task.id ? (
                <TextField
                  fullWidth
                  size="small"
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  disabled={loading}
                />
              ) : (
                <Typography
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {task.title}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
