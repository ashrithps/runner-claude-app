import { ReplitDB } from './replitdb'

export async function debugDatabase() {
  console.log('🔍 Debugging Replit Database...')

  try {
    // Get database stats
    const stats = await ReplitDB.getStats()
    console.log('📊 Database Stats:', stats)

    // Get all users
    const users = await ReplitDB.getAllUsers()
    console.log('👥 Users:', users.length)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.tower}, ${user.flat}`)
    })

    // Get all tasks
    const tasks = await ReplitDB.getAllTasks()
    console.log('📋 Tasks:', tasks.length)
    tasks.forEach(task => {
      console.log(`  - ${task.title} (${task.status}) - ₹${task.reward}`)
    })

    // Get notifications
    const notifications = await ReplitDB.getNotificationsByUserId('any')
    console.log('🔔 Notifications:', notifications.length)

    console.log('✅ Database debug completed successfully')
    return {
      success: true,
      stats,
      users: users.length,
      tasks: tasks.length,
      notifications: notifications.length
    }
  } catch (error) {
    console.error('❌ Database debug failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function createTestData() {
  console.log('🧪 Creating test data...')

  try {
    // Create test users
    const testUsers = [
      {
        email: 'test1@example.com',
        name: 'Test User 1',
        tower: 'Tower A',
        flat: 'Flat 101',
        mobile: '+91 98765 43210',
        available_for_tasks: true,
        email_notifications: true
      },
      {
        email: 'test2@example.com',
        name: 'Test User 2',
        tower: 'Tower B',
        flat: 'Flat 202',
        mobile: '+91 98765 43211',
        available_for_tasks: true,
        email_notifications: true
      }
    ]

    const createdUsers = []
    for (const userData of testUsers) {
      const user = await ReplitDB.createUser(userData)
      createdUsers.push(user)
      console.log(`✅ Created user: ${user.name}`)
    }

    // Create test tasks
    const testTasks = [
      {
        title: 'Test Task 1',
        description: 'This is a test task for debugging',
        location: 'Tower A, Flat 101',
        time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        reward: 50,
        poster_id: createdUsers[0].id,
        status: 'available' as const
      },
      {
        title: 'Test Task 2',
        description: 'Another test task for debugging',
        location: 'Tower B, Flat 202',
        time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        reward: 75,
        poster_id: createdUsers[1].id,
        status: 'available' as const
      }
    ]

    for (const taskData of testTasks) {
      const task = await ReplitDB.createTask(taskData)
      console.log(`✅ Created task: ${task.title}`)
    }

    // Create test notifications
    const testNotifications = [
      {
        user_id: createdUsers[0].id,
        task_id: 'test-task-1',
        type: 'task_assigned' as const,
        title: 'Test Notification 1',
        message: 'This is a test notification'
      },
      {
        user_id: createdUsers[1].id,
        task_id: 'test-task-2',
        type: 'task_completed' as const,
        title: 'Test Notification 2',
        message: 'This is another test notification'
      }
    ]

    for (const notificationData of testNotifications) {
      const notification = await ReplitDB.createNotification({
        ...notificationData,
        read: false,
        sent_via_email: false
      })
      console.log(`✅ Created notification: ${notification.title}`)
    }

    console.log('✅ Test data created successfully')
    return {
      success: true,
      usersCreated: createdUsers.length,
      tasksCreated: testTasks.length,
      notificationsCreated: testNotifications.length
    }
  } catch (error) {
    console.error('❌ Failed to create test data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function clearAllData() {
  console.log('🗑️ Clearing all data...')

  try {
    await ReplitDB.clearAllData()
    console.log('✅ All data cleared successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Failed to clear data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}