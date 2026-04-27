export type GoogleTask = {
  id: string
  title: string
  completed: boolean
  updated?: string
}

type GoogleTasksResponse = {
  items?: Array<{
    id?: string
    title?: string
    status?: 'needsAction' | 'completed'
    updated?: string
  }>
}

async function googleTasksRequest(
  accessToken: string,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  })

  if (response.status === 401) {
    throw new Error('Google session expired. Please sign in again.')
  }

  if (response.status === 403) {
    throw new Error(
      'Google token is missing tasks write permission. Sign out and sign in again to grant tasks access.',
    )
  }

  if (!response.ok) {
    throw new Error('Google Tasks request failed.')
  }

  return response
}

export async function fetchTasks(accessToken: string): Promise<GoogleTask[]> {
  const url = new URL('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks')
  url.searchParams.set('showCompleted', 'true')
  url.searchParams.set('showHidden', 'true')
  url.searchParams.set('maxResults', '100')

  const response = await googleTasksRequest(accessToken, url.toString())
  const data = (await response.json()) as GoogleTasksResponse

  return (data.items ?? [])
    .filter((task) => task.id)
    .map((task) => ({
      id: task.id as string,
      title: task.title?.trim() || 'Untitled task',
      completed: task.status === 'completed',
      updated: task.updated,
    }))
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return (b.updated ?? '').localeCompare(a.updated ?? '')
    })
}

export async function createTask(
  accessToken: string,
  title: string,
): Promise<GoogleTask> {
  const trimmed = title.trim()
  if (!trimmed) {
    throw new Error('Task title cannot be empty.')
  }

  const response = await googleTasksRequest(
    accessToken,
    'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks',
    {
      method: 'POST',
      body: JSON.stringify({ title: trimmed }),
    },
  )

  const task = (await response.json()) as {
    id?: string
    title?: string
    status?: 'needsAction' | 'completed'
    updated?: string
  }

  if (!task.id) {
    throw new Error('Google Tasks did not return a new task id.')
  }

  return {
    id: task.id,
    title: task.title?.trim() || trimmed,
    completed: task.status === 'completed',
    updated: task.updated,
  }
}

export async function updateTask(
  accessToken: string,
  task: { id: string; title?: string; completed?: boolean },
): Promise<void> {
  const body: Record<string, string | null> = {}

  if (typeof task.title === 'string') {
    const trimmed = task.title.trim()
    if (!trimmed) {
      throw new Error('Task title cannot be empty.')
    }
    body.title = trimmed
  }

  if (typeof task.completed === 'boolean') {
    if (task.completed) {
      body.status = 'completed'
      body.completed = new Date().toISOString()
    } else {
      body.status = 'needsAction'
      body.completed = null
    }
  }

  await googleTasksRequest(
    accessToken,
    `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${task.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  )
}

export async function deleteTask(
  accessToken: string,
  taskId: string,
): Promise<void> {
  await googleTasksRequest(
    accessToken,
    `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`,
    { method: 'DELETE' },
  )
}
