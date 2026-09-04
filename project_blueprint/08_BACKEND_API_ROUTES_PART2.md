# MLR Associates — Part 8: Junior Operations, Senior Strategy & Automation API Routes (Part 2)

This document contains API Route Handlers for Junior Task Management, Timelog Timer & Timesheets, Daily EOD Logs, Junior Drafts, Legal Research, Urgent Escalations, Senior Strategy & Cross-Exam, Checklists, Vault, Reminders Engine, Cron Background Jobs, and Analytics.

---

### File: `src/app/api/juniors/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ─── GET /api/juniors ────────────────────────────────────────────────────────
// Returns all JUNIOR and INTERN users with workload stats.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.JUNIOR && session.user.role !== Role.INTERN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const juniors = await prisma.user.findMany({
      where: { role: { in: [Role.JUNIOR, Role.INTERN] } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        designation: true,
        createdAt: true,
        juniorCases: {
          select: {
            id: true,
            status: true,
          },
        },
        juniorTasks: {
          select: {
            id: true,
            status: true,
            billableHours: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedJuniors = juniors.map((j) => {
      const activeCases = j.juniorCases.filter((c) => c.status !== 'CLOSED').length;
      const totalTasks = j.juniorTasks.length;
      const pendingTasks = j.juniorTasks.filter((t) => t.status !== 'DONE').length;
      const totalHours = j.juniorTasks.reduce((sum, t) => sum + t.billableHours, 0);

      return {
        id: j.id,
        name: j.name,
        email: j.email,
        phone: j.phone,
        role: j.role,
        designation: j.designation || (j.role === 'INTERN' ? 'Intern' : 'Junior Advocate'),
        createdAt: j.createdAt,
        caseloadCount: activeCases,
        totalTasks,
        pendingTasks,
        billableHours: totalHours,
      };
    });

    return NextResponse.json(formattedJuniors, {
      headers: {
        'Cache-Control': 'private, max-age=2, stale-while-revalidate=5',
      },
    });
  } catch (error: any) {
    console.error('Error fetching juniors list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── POST /api/juniors ───────────────────────────────────────────────────────
// Creates a new JUNIOR or INTERN user. Admin only.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, role = 'JUNIOR', designation, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // Validate role is JUNIOR or INTERN only
    if (role !== 'JUNIOR' && role !== 'INTERN') {
      return NextResponse.json({ error: 'Role must be JUNIOR or INTERN.' }, { status: 400 });
    }

    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }

    // Hash password (default: name + "123" if not provided)
    const rawPassword = password || `${name.split(' ')[0].toLowerCase()}123`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role as Role,
        designation: designation || (role === 'INTERN' ? 'Intern' : 'Junior Advocate'),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        designation: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user, generatedPassword: rawPassword });
  } catch (error: any) {
    console.error('[Create Junior/Intern Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ─── DELETE /api/juniors ─────────────────────────────────────────────────────
// Removes a JUNIOR or INTERN user by ID. Admin only.
// Unassigns them from any cases and deletes their tasks first.
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Verify user exists and is JUNIOR or INTERN
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (user.role !== Role.JUNIOR && user.role !== Role.INTERN) {
      return NextResponse.json({ error: 'Can only remove Junior or Intern users.' }, { status: 400 });
    }

    // Unassign from all cases
    await prisma.case.updateMany({
      where: { assignedTo: userId },
      data: { assignedTo: null },
    });

    // Delete their tasks
    await prisma.task.deleteMany({
      where: { assignedTo: userId },
    });

    // Delete user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true, message: `${user.name} has been removed.` });
  } catch (error: any) {
    console.error('[Delete Junior/Intern Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/juniors/performance/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const juniorId = searchParams.get('juniorId');

    if (!juniorId) {
      return NextResponse.json({ error: 'Missing juniorId parameter.' }, { status: 400 });
    }

    const [
      junior,
      tasksAssigned,
      tasksCompleted,
      appearances,
      drafts,
      timeLogs,
      escalations,
      skillTags,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: juniorId },
        select: { id: true, name: true, email: true, phone: true, designation: true, createdAt: true },
      }),
      prisma.task.count({ where: { assignedTo: juniorId } }),
      prisma.task.count({ where: { assignedTo: juniorId, status: 'DONE' } }),
      prisma.appearance.count({ where: { juniorId } }),
      prisma.draft.findMany({ where: { juniorId }, select: { status: true } }),
      prisma.timeLog.findMany({ where: { juniorId, approved: true }, select: { duration: true } }),
      prisma.escalation.count({ where: { raisedBy: juniorId } }),
      prisma.skillTag.findMany({ where: { juniorId }, select: { tag: true } }),
    ]);

    if (!junior) {
      return NextResponse.json({ error: 'Junior not found.' }, { status: 404 });
    }

    const totalBillableHours = timeLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
    const draftsApproved = drafts.filter(d => d.status === 'APPROVED' || d.status === 'FILED').length;
    const draftsRedo = drafts.filter(d => d.status === 'REDO').length;

    return NextResponse.json({
      success: true,
      performance: {
        junior,
        tasksAssigned,
        tasksCompleted,
        completionRate: tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0,
        appearancesCount: appearances,
        draftsApproved,
        draftsRedo,
        totalBillableHours: Math.round(totalBillableHours * 10) / 10,
        escalationsRaised: escalations,
        skillTags: skillTags.map(st => st.tag),
      },
    });
  } catch (error: any) {
    console.error('[Junior Performance Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/tasks/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Get Tasks
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    let tasks: any[] = [];

    if (role === Role.ADMIN) {
      // Admin sees all tasks
      tasks = await prisma.task.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          deadline: true,
          billableHours: true,
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true } },
        },
        orderBy: { deadline: 'asc' },
      });
    } else if (role === Role.JUNIOR || role === Role.INTERN) {
      // Junior sees assigned tasks
      tasks = await prisma.task.findMany({
        where: { assignedTo: id },
        select: {
          id: true,
          title: true,
          status: true,
          deadline: true,
          billableHours: true,
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { deadline: 'asc' },
      });
    } else {
      tasks = [];
    }

    return NextResponse.json(tasks, {
      headers: {
        'Cache-Control': 'private, max-age=2, stale-while-revalidate=5',
      },
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Create Task (Admin or Case Manager)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { caseId, assignedTo, title, deadline, status = 'TODO', billableHours = 0 } = body;

    if (!caseId || !assignedTo || !title) {
      return NextResponse.json({ error: 'Missing caseId, assignedTo, or title' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        caseId,
        assignedTo,
        title,
        status,
        deadline: deadline ? new Date(deadline) : null,
        billableHours: parseFloat(billableHours),
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/tasks/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status, billableHours, title, deadline } = body;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Role protection: only ADMIN or the assigned JUNIOR can modify
    if ((session.user.role === Role.JUNIOR || session.user.role === Role.INTERN) && existingTask.assignedTo !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden. You are not assigned to this task.' }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (billableHours !== undefined) updateData.billableHours = parseFloat(billableHours);
    if (title) updateData.title = title;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/tasks/[id]/status/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    const { status, rating, feedback } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Missing status parameter.' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status, // ASSIGNED | IN_PROGRESS | REVIEW | DONE
        rating: rating ? parseInt(rating, 10) : undefined,
        feedback: feedback || undefined,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('[Task Status Update Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/timelogs/start/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, category = 'RESEARCH', description } = await req.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }

    // Stop any existing running timer for this junior
    const runningLog = await prisma.timeLog.findFirst({
      where: {
        juniorId: session.user.id,
        endTime: null,
      },
    });

    if (runningLog) {
      const now = new Date();
      const diffMs = now.getTime() - new Date(runningLog.startTime).getTime();
      const durationHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

      await prisma.timeLog.update({
        where: { id: runningLog.id },
        data: {
          endTime: now,
          duration: durationHours,
        },
      });
    }

    // Create new running TimeLog
    const timeLog = await prisma.timeLog.create({
      data: {
        taskId,
        juniorId: session.user.id,
        category,
        startTime: new Date(),
        description: description || 'Active task session',
      },
    });

    // Update task status to IN_PROGRESS
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS' },
    });

    return NextResponse.json({ success: true, timeLog });
  } catch (error: any) {
    console.error('[TimeLog Start Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/timelogs/[id]/stop/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeLogId = params.id;
    const { description } = await req.json().catch(() => ({}));

    const existingLog = await prisma.timeLog.findUnique({
      where: { id: timeLogId },
    });

    if (!existingLog) {
      return NextResponse.json({ error: 'Time log not found.' }, { status: 404 });
    }

    const now = new Date();
    const diffMs = now.getTime() - new Date(existingLog.startTime).getTime();
    const durationHours = Math.max(0.05, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);

    const updatedLog = await prisma.timeLog.update({
      where: { id: timeLogId },
      data: {
        endTime: now,
        duration: durationHours,
        description: description || existingLog.description || 'Completed task timer session',
      },
    });

    // Accumulate billableHours on Task
    await prisma.task.update({
      where: { id: existingLog.taskId },
      data: {
        billableHours: { increment: durationHours },
      },
    });

    return NextResponse.json({ success: true, timeLog: updatedLog });
  } catch (error: any) {
    console.error('[TimeLog Stop Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/timelogs/manual/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, category = 'RESEARCH', startTime, endTime, description } = await req.json();

    if (!taskId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing taskId, startTime, or endTime' }, { status: 400 });
    }

    const startObj = new Date(startTime);
    const endObj = new Date(endTime);
    const diffMs = endObj.getTime() - startObj.getTime();
    const durationHours = Math.max(0.1, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);

    const timeLog = await prisma.timeLog.create({
      data: {
        taskId,
        juniorId: session.user.id,
        category,
        startTime: startObj,
        endTime: endObj,
        duration: durationHours,
        description: description || 'Manual time log entry',
      },
    });

    await prisma.task.update({
      where: { id: taskId },
      data: {
        billableHours: { increment: durationHours },
      },
    });

    return NextResponse.json({ success: true, timeLog });
  } catch (error: any) {
    console.error('[TimeLog Manual Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/timelogs/approve/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { logIds, approved = true } = await req.json();

    if (!Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json({ error: 'Missing logIds array' }, { status: 400 });
    }

    await prisma.timeLog.updateMany({
      where: { id: { in: logIds } },
      data: { approved },
    });

    return NextResponse.json({ success: true, count: logIds.length, approved });
  } catch (error: any) {
    console.error('[Timesheet Approve Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/timelogs/timesheet/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const juniorIdParam = searchParams.get('juniorId');
    const targetJuniorId = (session.user.role === Role.ADMIN && juniorIdParam) ? juniorIdParam : session.user.id;

    // Fetch time logs for past 30 days (weekly timesheet cycle)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pendingOnly = searchParams.get('pendingOnly') === 'true';

    const logs = await prisma.timeLog.findMany({
      where: {
        juniorId: targetJuniorId,
        startTime: { gte: thirtyDaysAgo },
        ...(pendingOnly ? { approved: false } : {}),
      },
      include: {
        task: { select: { title: true, case: { select: { caseNumber: true } } } },
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('[Timesheet Fetch Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/dailylog/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id } = session.user;
    let dailyLogs;

    if (role === Role.ADMIN) {
      dailyLogs = await prisma.dailyLog.findMany({
        include: {
          junior: { select: { name: true, email: true } },
        },
        orderBy: { date: 'desc' },
      });
    } else {
      dailyLogs = await prisma.dailyLog.findMany({
        where: { juniorId: id },
        orderBy: { date: 'desc' },
      });
    }

    return NextResponse.json({ success: true, dailyLogs });
  } catch (error: any) {
    console.error('[DailyLog GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tasksCompleted = [], hoursWorked, courtVisited = false, issues, escalate = false } = await req.json();

    if (hoursWorked === undefined || hoursWorked === null) {
      return NextResponse.json({ error: 'Missing hoursWorked parameter.' }, { status: 400 });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Upsert or create today's daily log
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        juniorId: session.user.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    let dailyLog;
    if (existingLog) {
      dailyLog = await prisma.dailyLog.update({
        where: { id: existingLog.id },
        data: {
          tasksCompleted: Array.isArray(tasksCompleted) ? tasksCompleted : [tasksCompleted],
          hoursWorked: parseFloat(hoursWorked),
          courtVisited: Boolean(courtVisited),
          issues,
          escalate: Boolean(escalate),
          submittedAt: now,
        },
      });
    } else {
      dailyLog = await prisma.dailyLog.create({
        data: {
          juniorId: session.user.id,
          date: now,
          tasksCompleted: Array.isArray(tasksCompleted) ? tasksCompleted : [tasksCompleted],
          hoursWorked: parseFloat(hoursWorked),
          courtVisited: Boolean(courtVisited),
          issues,
          escalate: Boolean(escalate),
          submittedAt: now,
        },
      });
    }

    return NextResponse.json({ success: true, dailyLog });
  } catch (error: any) {
    console.error('[DailyLog POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/drafts/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id } = session.user;
    let drafts;

    if (role === Role.ADMIN) {
      drafts = await prisma.draft.findMany({
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      drafts = await prisma.draft.findMany({
        where: { juniorId: id },
        include: {
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    console.error('[Drafts GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, title, type = 'PETITION', fileUrl } = await req.json();

    if (!caseId || !title || !fileUrl) {
      return NextResponse.json({ error: 'Missing required parameters (caseId, title, fileUrl).' }, { status: 400 });
    }

    // Check if draft already exists to increment version
    const existing = await prisma.draft.findFirst({
      where: { caseId, title, juniorId: session.user.id },
      orderBy: { version: 'desc' },
    });

    const newVersion = existing ? existing.version + 1 : 1;

    const draft = await prisma.draft.create({
      data: {
        caseId,
        juniorId: session.user.id,
        title,
        type,
        status: 'UNDER_REVIEW',
        version: newVersion,
        fileUrl,
      },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('[Draft POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/drafts/[id]/review/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const draftId = params.id;
    const { status, comments } = await req.json();

    if (!status || !['APPROVED', 'REDO'].includes(status)) {
      return NextResponse.json({ error: 'Invalid review status. Must be APPROVED or REDO.' }, { status: 400 });
    }

    const draft = await prisma.draft.update({
      where: { id: draftId },
      data: { status, comments: comments || null },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('[Draft Senior Review Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/research/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id } = session.user;
    let researchLogs;

    if (role === Role.ADMIN) {
      researchLogs = await prisma.researchLog.findMany({
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      researchLogs = await prisma.researchLog.findMany({
        where: { juniorId: id },
        include: {
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, researchLogs });
  } catch (error: any) {
    console.error('[Research GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, sections = [], citations = [], source = 'SCC', summary } = await req.json();

    if (!caseId || !summary || summary.length < 10) {
      return NextResponse.json({ error: 'Summary must be at least 10 characters long.' }, { status: 400 });
    }

    const researchLog = await prisma.researchLog.create({
      data: {
        caseId,
        juniorId: session.user.id,
        sections: Array.isArray(sections) ? sections : [sections],
        citations: Array.isArray(citations) ? citations : [citations],
        source,
        summary,
        approved: false,
      },
    });

    return NextResponse.json({ success: true, researchLog });
  } catch (error: any) {
    console.error('[Research POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/research/[id]/approve/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { approved } = await req.json();

    const updated = await prisma.researchLog.update({
      where: { id: params.id },
      data: { approved: Boolean(approved) },
    });

    return NextResponse.json({ success: true, research: updated });
  } catch (error: any) {
    console.error('[Research Approve Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/escalations/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id } = session.user;
    let escalations;

    if (role === Role.ADMIN) {
      escalations = await prisma.escalation.findMany({
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      escalations = await prisma.escalation.findMany({
        where: { raisedBy: id },
        include: {
          case: { select: { caseNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, escalations });
  } catch (error: any) {
    console.error('[Escalations GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, reason = 'STRATEGY', description } = await req.json();

    if (!caseId || !description) {
      return NextResponse.json({ error: 'Missing caseId or description.' }, { status: 400 });
    }

    const escalation = await prisma.escalation.create({
      data: {
        caseId,
        raisedBy: session.user.id,
        reason,
        description,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, escalation });
  } catch (error: any) {
    console.error('[Escalation POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/escalations/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const escalationId = params.id;
    const { status } = await req.json(); // ACKNOWLEDGED | RESOLVED

    if (!status) {
      return NextResponse.json({ error: 'Missing status parameter.' }, { status: 400 });
    }

    const updatedEscalation = await prisma.escalation.update({
      where: { id: escalationId },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, escalation: updatedEscalation });
  } catch (error: any) {
    console.error('[Escalation Update Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/calls/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioAlert(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Call Alert Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK Escalation Alert] To: ${to} | Body: "${body}"`);
  return false;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, clientId, duration, summary, actionItems = [], escalate = false } = await req.json();

    if (!caseId || !clientId || !duration || !summary) {
      return NextResponse.json({ error: 'Missing required call log fields.' }, { status: 400 });
    }

    const callLog = await prisma.clientCallLog.create({
      data: {
        caseId,
        juniorId: session.user.id,
        clientId,
        date: new Date(),
        duration: parseInt(duration, 10),
        summary,
        actionItems: Array.isArray(actionItems) ? actionItems : [actionItems],
        escalate,
      },
    });

    let escalationCreated = null;
    if (escalate) {
      escalationCreated = await prisma.escalation.create({
        data: {
          caseId,
          raisedBy: session.user.id,
          reason: 'UNREACHABLE_CLIENT',
          description: `Call Log Escalation: ${summary}`,
          status: 'OPEN',
        },
      });

      // Fetch admin phone to alert via SMS
      const admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { phone: true, name: true },
      });

      if (admin && admin.phone) {
        await sendTwilioAlert(
          admin.phone,
          `Escalation Raised: Junior ${session.user.name} logged an urgent client call issue for Case ID: ${caseId}. - MLR ASSOCIATES`
        );
      }
    }

    return NextResponse.json({ success: true, callLog, escalation: escalationCreated });
  } catch (error: any) {
    console.error('[Call Log Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/learning/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id } = session.user;
    let learningItems;

    if (role === Role.ADMIN) {
      learningItems = await prisma.learningItem.findMany({
        include: {
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      learningItems = await prisma.learningItem.findMany({
        where: { juniorId: id },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, learningItems });
  } catch (error: any) {
    console.error('[Learning GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { juniorId, title, type = 'BARE_ACT', content } = await req.json();

    if (!juniorId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields (juniorId, title, content).' }, { status: 400 });
    }

    const learningItem = await prisma.learningItem.create({
      data: {
        juniorId,
        assignedBy: session.user.id,
        title,
        type,
        content,
        status: 'ASSIGNED',
      },
    });

    return NextResponse.json({ success: true, learningItem });
  } catch (error: any) {
    console.error('[Learning POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/learning/[id]/summary/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { summary, status } = await req.json();

    if (!['REVIEWED', 'REDO'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be REVIEWED or REDO.' }, { status: 400 });
    }

    const updated = await prisma.learningItem.update({
      where: { id: params.id },
      data: { summary: summary || undefined, status },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error('[Learning Summary Review Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/skilltags/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const juniorId = searchParams.get('juniorId') || session.user.id;

    const tags = await prisma.skillTag.findMany({
      where: { juniorId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tags });
  } catch (error: any) {
    console.error('[SkillTags GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { juniorId, tag } = await req.json();

    if (!juniorId || !tag) {
      return NextResponse.json({ error: 'Missing juniorId or tag parameter.' }, { status: 400 });
    }

    const skillTag = await prisma.skillTag.create({
      data: {
        juniorId,
        tag: tag.toUpperCase(),
        addedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, skillTag });
  } catch (error: any) {
    console.error('[SkillTag POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/templates/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error('[Templates GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { title, type = 'BAIL', fileUrl } = await req.json();

    if (!title || !fileUrl) {
      return NextResponse.json({ error: 'Missing title or fileUrl parameter.' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        title,
        type,
        fileUrl,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error('[Template POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/senior-drafts/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const drafts = await prisma.seniorDraft.findMany({
      where: { seniorId: session.user.id },
      include: {
        case: { select: { caseNumber: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, drafts });
  } catch (error: any) {
    console.error('[Senior Drafts GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, title, type = 'PETITION', content, exportUrl } = await req.json();

    if (!caseId || !title) {
      return NextResponse.json({ error: 'Missing caseId or title' }, { status: 400 });
    }

    const draft = await prisma.seniorDraft.create({
      data: {
        caseId,
        seniorId: session.user.id,
        title,
        type,
        content: content || '',
        status: 'DRAFTING',
        exportUrl,
      },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('[Senior Draft POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/senior-drafts/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await req.json();

    const draft = await prisma.seniorDraft.update({
      where: { id: params.id, seniorId: session.user.id },
      data: { content: content || '' },
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('[Senior Draft PATCH Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/senior-drafts/[id]/send/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const draftId = params.id;
    const { juniorId, notes } = await req.json();

    if (!juniorId) {
      return NextResponse.json({ error: 'Missing juniorId parameter.' }, { status: 400 });
    }

    const draft = await prisma.seniorDraft.findUnique({ where: { id: draftId } });
    if (!draft) {
      return NextResponse.json({ error: 'Senior draft not found.' }, { status: 404 });
    }

    // Create filing Task for junior
    const task = await prisma.task.create({
      data: {
        caseId: draft.caseId,
        assignedTo: juniorId,
        assignedBy: session.user.id,
        title: `Court Filing: ${draft.title}`,
        type: 'FILING',
        priority: 'URGENT',
        status: 'ASSIGNED',
        notes: notes || `Senior draft attached for court filing. Original draft ID: ${draft.id}`,
      },
    });

    // Update draft status to SENT_TO_JUNIOR
    await prisma.seniorDraft.update({
      where: { id: draftId },
      data: { status: 'SENT_TO_JUNIOR' },
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('[Senior Draft Send Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/review/queue/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== Role.SENIOR && session.user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [drafts, researchLogs, learningItems, timeLogs] = await Promise.all([
      prisma.draft.findMany({
        where: { status: 'UNDER_REVIEW' },
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.researchLog.findMany({
        where: { approved: false },
        include: {
          case: { select: { caseNumber: true, title: true } },
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.learningItem.findMany({
        where: { status: 'READ' },
        include: {
          junior: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.timeLog.findMany({
        where: { approved: false },
        include: {
          junior: { select: { name: true, email: true } },
          task: { select: { title: true, case: { select: { caseNumber: true } } } },
        },
        orderBy: { startTime: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      queue: {
        drafts,
        researchLogs,
        learningItems,
        timeLogs,
      },
    });
  } catch (error: any) {
    console.error('[Review Queue GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/strategy/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, theory, keyArguments = [], weakPoints = [], counterArgs = [], caseStrength = 'MODERATE', strengthReason, sharedWith = [] } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: 'Missing caseId' }, { status: 400 });
    }

    const existing = await prisma.caseStrategy.findUnique({ where: { caseId } });

    let strategy;
    if (existing) {
      strategy = await prisma.caseStrategy.update({
        where: { caseId },
        data: {
          theory: theory || '',
          keyArguments: Array.isArray(keyArguments) ? keyArguments : [keyArguments],
          weakPoints: Array.isArray(weakPoints) ? weakPoints : [weakPoints],
          counterArgs: Array.isArray(counterArgs) ? counterArgs : [counterArgs],
          caseStrength,
          strengthReason,
          sharedWith: Array.isArray(sharedWith) ? sharedWith : [sharedWith],
          version: { increment: 1 },
        },
      });
    } else {
      strategy = await prisma.caseStrategy.create({
        data: {
          caseId,
          seniorId: session.user.id,
          theory: theory || '',
          keyArguments: Array.isArray(keyArguments) ? keyArguments : [keyArguments],
          weakPoints: Array.isArray(weakPoints) ? weakPoints : [weakPoints],
          counterArgs: Array.isArray(counterArgs) ? counterArgs : [counterArgs],
          caseStrength,
          strengthReason,
          sharedWith: Array.isArray(sharedWith) ? sharedWith : [sharedWith],
        },
      });
    }

    return NextResponse.json({ success: true, strategy });
  } catch (error: any) {
    console.error('[Case Strategy POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/strategy/[caseId]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = params.caseId;
    const strategy = await prisma.caseStrategy.findUnique({
      where: { caseId },
      include: {
        case: { select: { caseNumber: true, title: true, court: true } },
      },
    });

    const opponentProfiles = await prisma.opponentProfile.findMany({ where: { caseId } });

    return NextResponse.json({ success: true, strategy, opponentProfiles });
  } catch (error: any) {
    console.error('[Case Strategy GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/checklist/[caseId]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = params.caseId;
    const checklist = await prisma.hearingChecklist.findUnique({ where: { caseId } });

    return NextResponse.json({ success: true, checklist });
  } catch (error: any) {
    console.error('[Checklist GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = params.caseId;
    const { documentsReady = false, argumentsDrafted = false, clientBriefed = false, juniorBriefed = false, vakalatnama = false, feeCollected = false } = await req.json();

    const items = [documentsReady, argumentsDrafted, clientBriefed, juniorBriefed, vakalatnama, feeCollected];
    const completedCount = items.filter(Boolean).length;
    const completionPct = Math.round((completedCount / 6) * 100);

    const checklist = await prisma.hearingChecklist.upsert({
      where: { caseId },
      update: {
        documentsReady,
        argumentsDrafted,
        clientBriefed,
        juniorBriefed,
        vakalatnama,
        feeCollected,
        completionPct,
      },
      create: {
        caseId,
        seniorId: session.user.id,
        documentsReady,
        argumentsDrafted,
        clientBriefed,
        juniorBriefed,
        vakalatnama,
        feeCollected,
        completionPct,
      },
    });

    return NextResponse.json({ success: true, checklist });
  } catch (error: any) {
    console.error('[Checklist POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/cross-exam/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    const whereClause: any = { seniorId: session.user.id };
    if (caseId) whereClause.caseId = caseId;

    const builders = await prisma.crossExamBuilder.findMany({
      where: whereClause,
      include: {
        case: { select: { caseNumber: true, title: true } },
        questions: { orderBy: { order: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, builders });
  } catch (error: any) {
    console.error('[Cross-Exam GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, witnessName, witnessRole = 'PW1' } = await req.json();

    if (!caseId || !witnessName) {
      return NextResponse.json({ error: 'Missing caseId or witnessName' }, { status: 400 });
    }

    const builder = await prisma.crossExamBuilder.create({
      data: {
        caseId,
        seniorId: session.user.id,
        witnessName,
        witnessRole,
      },
    });

    return NextResponse.json({ success: true, builder });
  } catch (error: any) {
    console.error('[Cross-Exam POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/cross-exam/[id]/questions/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const builderId = params.id;
    const { theme = 'GENERAL', question, expectedAnswer, followUp, isTrap = false } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Missing question text.' }, { status: 400 });
    }

    const count = await prisma.crossExamQuestion.count({ where: { builderId } });

    const qItem = await prisma.crossExamQuestion.create({
      data: {
        builderId,
        order: count + 1,
        theme,
        question,
        expectedAnswer,
        followUp,
        isTrap: Boolean(isTrap),
      },
    });

    return NextResponse.json({ success: true, question: qItem });
  } catch (error: any) {
    console.error('[Cross-Exam Question Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/opponent-profile/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, advocateName, firmName, behaviorNotes, winCount = 0, lossCount = 0 } = await req.json();

    if (!caseId || !advocateName) {
      return NextResponse.json({ error: 'Missing caseId or advocateName' }, { status: 400 });
    }

    const opponent = await prisma.opponentProfile.create({
      data: {
        caseId,
        seniorId: session.user.id,
        advocateName,
        firmName,
        behaviorNotes,
        winCount: parseInt(winCount, 10),
        lossCount: parseInt(lossCount, 10),
      },
    });

    return NextResponse.json({ success: true, opponent });
  } catch (error: any) {
    console.error('[Opponent Profile Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/judge-profile/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const judges = await prisma.judgeProfile.findMany({
      where: { seniorId: session.user.id },
      orderBy: { judgeName: 'asc' },
    });

    return NextResponse.json({ success: true, judges });
  } catch (error: any) {
    console.error('[Judge Profile GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { judgeName, court, notes } = await req.json();

    if (!judgeName || !court) {
      return NextResponse.json({ error: 'Missing judgeName or court' }, { status: 400 });
    }

    const judge = await prisma.judgeProfile.create({
      data: {
        seniorId: session.user.id,
        judgeName,
        court,
        notes,
      },
    });

    return NextResponse.json({ success: true, judge });
  } catch (error: any) {
    console.error('[Judge Profile POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/client-brief/[caseId]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = params.caseId;
    const brief = await prisma.clientBriefingNote.findUnique({ where: { caseId } });

    // Fetch recent events and call logs
    const [events, calls] = await Promise.all([
      prisma.caseEvent.findMany({
        where: { caseId },
        orderBy: { eventDate: 'desc' },
        take: 5,
      }),
      prisma.clientCallLog.findMany({
        where: { caseId },
        orderBy: { date: 'desc' },
        take: 3,
      }),
    ]);

    return NextResponse.json({ success: true, brief, events, calls });
  } catch (error: any) {
    console.error('[Client Brief GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = params.caseId;
    const { privateNotes, clientFlags = [], reminders = [] } = await req.json();

    const brief = await prisma.clientBriefingNote.upsert({
      where: { caseId },
      update: {
        privateNotes: privateNotes || '',
        clientFlags: Array.isArray(clientFlags) ? clientFlags : [clientFlags],
        reminders: Array.isArray(reminders) ? reminders : [reminders],
      },
      create: {
        caseId,
        seniorId: session.user.id,
        privateNotes: privateNotes || '',
        clientFlags: Array.isArray(clientFlags) ? clientFlags : [clientFlags],
        reminders: Array.isArray(reminders) ? reminders : [reminders],
      },
    });

    return NextResponse.json({ success: true, brief });
  } catch (error: any) {
    console.error('[Client Brief POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/post-hearing/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioClientSMS(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Client SMS Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK Post-Hearing Client Update] To: ${to} | Body: "${body}"`);
  return false;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, hearingDate, argued, judgeObservations, orderPassed, orderFileUrl, nextSteps = [], notifyClient = false } = await req.json();

    if (!caseId || !argued) {
      return NextResponse.json({ error: 'Missing caseId or argued content.' }, { status: 400 });
    }

    const note = await prisma.postHearingNote.create({
      data: {
        caseId,
        seniorId: session.user.id,
        hearingDate: hearingDate ? new Date(hearingDate) : new Date(),
        argued,
        judgeObservations,
        orderPassed,
        orderFileUrl,
        nextSteps: Array.isArray(nextSteps) ? nextSteps : [nextSteps],
        notifyClient: Boolean(notifyClient),
      },
    });

    // Auto-create CaseEvent timeline item
    const targetCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { client: { select: { name: true, phone: true } } },
    });

    if (targetCase) {
      await prisma.caseEvent.create({
        data: {
          caseId,
          eventDate: new Date(),
          title: `Post-Hearing Note: ${orderPassed || 'Arguments Concluded'}`,
          notes: `Senior Advocate ${session.user.name}: ${argued}`,
        },
      });

      if (notifyClient && targetCase.client && targetCase.client.phone) {
        const smsText = `Update on your case ${targetCase.caseNumber}: ${orderPassed || 'Hearing arguments completed.'} Next steps logged. - MLR ASSOCIATES`;
        await sendTwilioClientSMS(targetCase.client.phone, smsText);
      }
    }

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error('[Post-Hearing POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/post-hearing/list/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = await prisma.postHearingNote.findMany({
      where: { seniorId: session.user.id },
      include: {
        case: { select: { caseNumber: true, title: true, court: true } },
      },
      orderBy: { hearingDate: 'desc' },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error('[Post-Hearing GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/judgments/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    let judgments;

    if (role === Role.ADMIN || role === Role.SENIOR) {
      judgments = await prisma.judgmentLibrary.findMany({
        where: {
          OR: [{ seniorId: id }, { isShared: true }],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      judgments = await prisma.judgmentLibrary.findMany({
        where: { isShared: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, judgments });
  } catch (error: any) {
    console.error('[Judgments GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, court, year, lawArea = 'CRIMINAL', fileUrl, highlights = [], tags = [], isShared = false } = await req.json();

    if (!title || !court || !year || !fileUrl) {
      return NextResponse.json({ error: 'Missing required judgment parameters.' }, { status: 400 });
    }

    const judgment = await prisma.judgmentLibrary.create({
      data: {
        seniorId: session.user.id,
        title,
        court,
        year: parseInt(year, 10),
        lawArea,
        fileUrl,
        highlights: Array.isArray(highlights) ? highlights : [highlights],
        tags: Array.isArray(tags) ? tags : [tags],
        isShared: Boolean(isShared),
      },
    });

    return NextResponse.json({ success: true, judgment });
  } catch (error: any) {
    console.error('[Judgments POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/vault/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, role } = session.user;
    let items;

    if (role === Role.ADMIN || role === Role.SENIOR) {
      items = await prisma.precedentVault.findMany({
        where: {
          OR: [
            { seniorId: id },
            { isShared: true },
            { sharedWith: { has: id } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      items = await prisma.precedentVault.findMany({
        where: {
          OR: [
            { isShared: true },
            { sharedWith: { has: id } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('[Precedent Vault GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, type = 'ARGUMENT', content, lawArea = 'CRIMINAL', court, year, tags = [], isShared = false, sharedWith = [] } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing title or content.' }, { status: 400 });
    }

    const item = await prisma.precedentVault.create({
      data: {
        seniorId: session.user.id,
        title,
        type,
        content,
        lawArea,
        court,
        year: year ? parseInt(year, 10) : null,
        tags: Array.isArray(tags) ? tags : [tags],
        isShared: Boolean(isShared),
        sharedWith: Array.isArray(sharedWith) ? sharedWith : [sharedWith],
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('[Precedent Vault POST Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/senior/analytics/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== Role.SENIOR && session.user.role !== Role.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const seniorId = session.user.id;

    const [outcomes, activeCasesCount, draftsCount, appearancesCount] = await Promise.all([
      prisma.caseOutcome.findMany({
        where: { seniorId },
        include: { case: { select: { caseNumber: true, title: true } } },
      }),
      prisma.case.count({ where: { seniorId, status: 'ACTIVE' } }),
      prisma.seniorDraft.count({ where: { seniorId } }),
      prisma.appearance.count({ where: { case: { seniorId } } }),
    ]);

    const totalOutcomes = outcomes.length;
    const winsCount = outcomes.filter(o => o.outcome === 'WON').length;
    const winRate = totalOutcomes > 0 ? Math.round((winsCount / totalOutcomes) * 100) : 0;
    const avgDuration = totalOutcomes > 0
      ? Math.round(outcomes.reduce((acc, o) => acc + o.duration, 0) / totalOutcomes)
      : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        activeCasesCount,
        casesArguedCount: appearancesCount,
        totalOutcomes,
        winsCount,
        winRate,
        avgDuration,
        draftsCount,
        outcomes,
      },
    });
  } catch (error: any) {
    console.error('[Senior Analytics Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/senior/notifications/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.seniorNotification.findMany({
      where: { seniorId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    console.error('[Senior Notifications GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/senior/notifications/read/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.seniorNotification.updateMany({
      where: { seniorId: session.user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Notifications Read Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/admin/dashboard/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * GET /api/admin/dashboard
 * Single consolidated endpoint — replaces 5 separate API calls on admin homepage.
 * All queries run in parallel. Only fields needed for dashboard cards are fetched.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalClients,
      activeCasesCount,
      appointmentsToday,
      recentAppointments,
      recentCaseEvents,
      recentInvoices,
      monthlyRevenue,
      clients,
      juniors,
    ] = await Promise.all([
      // Metric: total client count (scalar — instant)
      prisma.user.count({ where: { role: Role.CLIENT } }),

      // Metric: active cases count (scalar)
      prisma.case.count({ where: { status: { notIn: ['CLOSED', 'INTAKE'] } } }),

      // Metric: today's appointments count (scalar)
      prisma.appointment.count({
        where: { date: { gte: todayStart, lte: todayEnd } },
      }),

      // Activity: last 5 appointments — minimal fields
      prisma.appointment.findMany({
        where: { date: { gte: todayStart } },
        select: {
          id: true,
          date: true,
          timeSlot: true,
          caseType: true,
          status: true,
          client: { select: { name: true } },
        },
        orderBy: { date: 'asc' },
        take: 5,
      }),

      // Activity: last 5 case events — minimal fields
      prisma.caseEvent.findMany({
        select: {
          id: true,
          title: true,
          eventDate: true,
          case: { select: { caseNumber: true } },
        },
        orderBy: { eventDate: 'desc' },
        take: 5,
      }),

      // Activity: last 5 invoices — minimal fields
      prisma.invoice.findMany({
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          client: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Metric: monthly revenue via DB aggregation (no row loading)
      prisma.transaction.aggregate({
        where: {
          type: 'INFLOW',
          date: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),

      // Dropdown data for Add Client / Add Case forms
      prisma.user.findMany({
        where: { role: Role.CLIENT },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
        take: 200,
      }),

      // Dropdown data for Assign Junior in Add Case form
      prisma.user.findMany({
        where: { role: { in: [Role.JUNIOR, Role.INTERN] } },
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Build unified activity feed
    const activities = [
      ...recentAppointments.map((a) => ({
        id: a.id,
        type: 'appointment' as const,
        title: `Appointment: ${a.client.name}`,
        detail: `${a.caseType} — ${a.timeSlot} (${a.status})`,
        date: a.date,
      })),
      ...recentCaseEvents.map((e) => ({
        id: e.id,
        type: 'case_event' as const,
        title: e.title,
        detail: `Case ${e.case.caseNumber}`,
        date: e.eventDate,
      })),
      ...recentInvoices.map((i) => ({
        id: i.id,
        type: 'invoice' as const,
        title: `Invoice: ₹${i.amount.toLocaleString('en-IN')}`,
        detail: `${i.client.name} — ${i.status}`,
        date: i.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    return NextResponse.json(
      {
        metrics: {
          totalClients,
          activeCases: activeCasesCount,
          appointmentsToday,
          monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
        },
        activities,
        clients,
        juniors,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=20, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('[Admin Dashboard API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/analytics/revenue/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    // Get transactions over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    // Group transactions by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

    // Initialize last 6 months
    const currentMonth = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      monthlyData[label] = { revenue: 0, expenses: 0 };
    }

    // Populate data
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      if (monthlyData[label]) {
        if (t.type === 'INFLOW') {
          monthlyData[label].revenue += t.amount;
        } else {
          monthlyData[label].expenses += t.amount;
        }
      }
    });

    const labels = Object.keys(monthlyData);
    const revenues = labels.map((l) => monthlyData[l].revenue);
    const expenses = labels.map((l) => monthlyData[l].expenses);

    return NextResponse.json({
      labels,
      revenues,
      expenses,
    });
  } catch (error: any) {
    console.error('Error calculating monthly revenue analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/analytics/cases/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, CaseStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    // Run all aggregations in parallel — no full table scan, no include:client
    const [statusGroups, typeGroups, closedCases, recentCases] = await Promise.all([
      // 1. Status distribution — pure DB groupBy, never loads rows into JS
      prisma.case.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      // 2. Type/practice area distribution
      prisma.case.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
      // 3. Only closed cases, only fields needed for avg resolution calc
      prisma.case.findMany({
        where: { status: CaseStatus.CLOSED },
        select: { createdAt: true, updatedAt: true },
      }),
      // 4. Last 6 months cases — only createdAt + status needed for timeline
      prisma.case.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: { createdAt: true, updatedAt: true, status: true },
      }),
    ]);

    // Build status counts map
    const statusCounts: Record<string, number> = {
      INTAKE: 0, ACTIVE: 0, ARGUED: 0, JUDGMENT: 0, CLOSED: 0,
    };
    statusGroups.forEach((g) => {
      statusCounts[g.status] = g._count._all;
    });

    // Build type counts map
    const typeCounts: Record<string, number> = {};
    typeGroups.forEach((g) => {
      typeCounts[g.type] = g._count._all;
    });

    // Average resolution time
    let avgResolutionTime = 45;
    if (closedCases.length > 0) {
      const totalDays = closedCases.reduce((sum, c) => {
        const diff = Math.max(1, Math.round(
          (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / 86400000
        ));
        return sum + diff;
      }, 0);
      avgResolutionTime = Math.round(totalDays / closedCases.length);
    }

    // Opened vs Closed timeline (last 6 months)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const openedVsClosed: Record<string, { opened: number; closed: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
      openedVsClosed[label] = { opened: 0, closed: 0 };
    }
    recentCases.forEach((c) => {
      const openLabel = `${months[new Date(c.createdAt).getMonth()]} ${String(new Date(c.createdAt).getFullYear()).slice(-2)}`;
      if (openedVsClosed[openLabel]) openedVsClosed[openLabel].opened += 1;
      if (c.status === CaseStatus.CLOSED) {
        const closeLabel = `${months[new Date(c.updatedAt).getMonth()]} ${String(new Date(c.updatedAt).getFullYear()).slice(-2)}`;
        if (openedVsClosed[closeLabel]) openedVsClosed[closeLabel].closed += 1;
      }
    });

    const timelineLabels = Object.keys(openedVsClosed);

    // Top 3 practice areas
    const sortedTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json(
      {
        statusCounts,
        typeCounts,
        avgResolutionTime,
        openedVsClosed: {
          labels: timelineLabels,
          opened: timelineLabels.map((l) => openedVsClosed[l].opened),
          closed: timelineLabels.map((l) => openedVsClosed[l].closed),
        },
        topPracticeAreas: sortedTypes,
        totalCases: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching case analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/reminders/settings/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// ─── GET /api/reminders/settings ─────────────────────────────────────────────
// Returns current ReminderSetting (singleton). Creates defaults if none exists.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    let settings = await prisma.reminderSetting.findFirst();

    if (!settings) {
      // Bootstrap defaults on first access
      settings = await prisma.reminderSetting.create({
        data: { daysBeforeHearing: 1, morningOfHearing: true },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('[Reminder Settings GET Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ─── PUT /api/reminders/settings ─────────────────────────────────────────────
// Updates the singleton ReminderSetting row (upsert).
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { daysBeforeHearing, morningOfHearing, customMessage } = body;

    const existing = await prisma.reminderSetting.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.reminderSetting.update({
        where: { id: existing.id },
        data: {
          ...(daysBeforeHearing !== undefined && { daysBeforeHearing: Number(daysBeforeHearing) }),
          ...(morningOfHearing !== undefined && { morningOfHearing: Boolean(morningOfHearing) }),
          ...(customMessage !== undefined && { customMessage: customMessage || null }),
        },
      });
    } else {
      settings = await prisma.reminderSetting.create({
        data: {
          daysBeforeHearing: Number(daysBeforeHearing ?? 1),
          morningOfHearing: Boolean(morningOfHearing ?? true),
          customMessage: customMessage || null,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('[Reminder Settings PUT Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/reminders/send/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, ReminderStatus } from '@prisma/client';
import twilio from 'twilio';

const ADVOCATE_NAME = 'M L Ramesh, MLR Associates';

function buildSmsMessage(
  templateType: 'day_before' | 'morning_of',
  caseNumber: string,
  title: string,
  court: string,
  date: string,
  customMessage?: string | null
): string {
  if (customMessage) {
    return customMessage
      .replace('{caseNumber}', caseNumber)
      .replace('{title}', title)
      .replace('{court}', court)
      .replace('{date}', date)
      .replace('{advocateName}', ADVOCATE_NAME);
  }

  if (templateType === 'day_before') {
    return `Reminder: Your case ${caseNumber} - ${title} has a hearing tomorrow (${date}) at ${court}. Please be prepared. - ${ADVOCATE_NAME}`;
  }
  return `Today's Hearing: Case ${caseNumber} - ${title} at ${court}. Hearing scheduled for today ${date}. - ${ADVOCATE_NAME}`;
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    const client = twilio(accountSid, authToken);
    await client.messages.create({ body, from: twilioPhone, to });
    return true;
  }

  // Mock log when Twilio is not configured
  console.log(`[Twilio MOCK] To: ${to} | Message: "${body}"`);
  return false;
}

// ─── POST /api/reminders/send ────────────────────────────────────────────────
// Handles both:
//  a) New case-based hearing reminder  → { caseId, templateType }
//  b) Legacy booking confirmation       → { phone, email, clientName, date, timeSlot, type }
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();

    // ── Legacy booking-confirmation path (backward-compatible) ──
    if (!body.caseId) {
      const { phone, email, clientName, date, timeSlot, type = 'booking_confirmation' } = body;
      if (!phone && !email) {
        return NextResponse.json({ error: 'Missing contact info (phone or email)' }, { status: 400 });
      }

      const smsText =
        type === 'booking_confirmation'
          ? `Dear ${clientName}, your consultation at MLR Associates is CONFIRMED for ${date} at ${timeSlot}. Thank you.`
          : `Reminder: Dear ${clientName}, your MLR Associates hearing/consultation is scheduled in 24 hours (${date} at ${timeSlot}).`;

      let twilioSent = false;
      if (phone) {
        try {
          twilioSent = await sendSms(phone, smsText);
        } catch (err) {
          console.error('[Twilio Error]', err);
        }
      }

      return NextResponse.json({ success: true, twilioSent, simulated: !twilioSent });
    }

    // ── New case-based hearing reminder path ──
    const { caseId, templateType = 'day_before' } = body as {
      caseId: string;
      templateType?: 'day_before' | 'morning_of';
    };

    // Get settings for custom message template
    const settings = await prisma.reminderSetting.findFirst();

    // Fetch case with client + junior phone numbers
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        junior: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 });
    }

    const hearingDate = caseRecord.nextHearing
      ? new Date(caseRecord.nextHearing).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'TBD';

    const message = buildSmsMessage(
      templateType,
      caseRecord.caseNumber,
      caseRecord.title,
      caseRecord.court,
      hearingDate,
      settings?.customMessage
    );

    const results: { recipient: string; status: string; phone: string | null }[] = [];

    // ── Send to Client ──
    if (caseRecord.client.phone) {
      let sent = false;
      try {
        sent = await sendSms(caseRecord.client.phone, message);
      } catch (err) {
        console.error('[Twilio Client Error]', err);
      }

      await prisma.hearingReminder.create({
        data: {
          caseId,
          recipientId: caseRecord.client.id,
          recipientType: 'CLIENT',
          message,
          status: sent ? ReminderStatus.SENT : ReminderStatus.FAILED,
          sentAt: sent ? new Date() : null,
          scheduledFor: caseRecord.nextHearing,
        },
      });

      results.push({ recipient: caseRecord.client.name, status: sent ? 'SENT' : 'FAILED', phone: caseRecord.client.phone });
    } else {
      results.push({ recipient: caseRecord.client.name, status: 'SKIPPED_NO_PHONE', phone: null });
    }

    // ── Send to Junior (if assigned) ──
    if (caseRecord.junior) {
      if (caseRecord.junior.phone) {
        let sent = false;
        try {
          sent = await sendSms(caseRecord.junior.phone, message);
        } catch (err) {
          console.error('[Twilio Junior Error]', err);
        }

        await prisma.hearingReminder.create({
          data: {
            caseId,
            recipientId: caseRecord.junior.id,
            recipientType: 'JUNIOR',
            message,
            status: sent ? ReminderStatus.SENT : ReminderStatus.FAILED,
            sentAt: sent ? new Date() : null,
            scheduledFor: caseRecord.nextHearing,
          },
        });

        results.push({ recipient: caseRecord.junior.name, status: sent ? 'SENT' : 'FAILED', phone: caseRecord.junior.phone });
      } else {
        results.push({ recipient: caseRecord.junior.name, status: 'SKIPPED_NO_PHONE', phone: null });
      }
    }

    return NextResponse.json({ success: true, caseId, results });
  } catch (error: any) {
    console.error('[Reminder Send Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/reminders/send-upcoming/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReminderStatus } from '@prisma/client';
import twilio from 'twilio';

const ADVOCATE_NAME = 'M L Ramesh, MLR Associates';

function buildSmsMessage(
  templateType: 'day_before' | 'morning_of',
  caseNumber: string,
  title: string,
  court: string,
  date: string,
  customMessage?: string | null
): string {
  if (customMessage) {
    return customMessage
      .replace('{caseNumber}', caseNumber)
      .replace('{title}', title)
      .replace('{court}', court)
      .replace('{date}', date)
      .replace('{advocateName}', ADVOCATE_NAME);
  }

  if (templateType === 'day_before') {
    return `Reminder: Your case ${caseNumber} - ${title} has a hearing tomorrow (${date}) at ${court}. Please be prepared. - ${ADVOCATE_NAME}`;
  }
  return `Today's Hearing: Case ${caseNumber} - ${title} at ${court}. Hearing scheduled for today ${date}. - ${ADVOCATE_NAME}`;
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    const client = twilio(accountSid, authToken);
    await client.messages.create({ body, from: twilioPhone, to });
    return true;
  }

  console.log(`[Twilio MOCK] To: ${to} | Message: "${body}"`);
  return false;
}

// ─── POST /api/reminders/send-upcoming ───────────────────────────────────────
// Cron-ready endpoint. Protected by Authorization: Bearer <CRON_SECRET>
// Finds all non-closed cases with nextHearing within the next 24 hours.
// Skips cases that already have a SENT reminder today.
// Sends SMS to both client and junior (if phone available).
export async function POST(req: Request) {
  try {
    // Auth check: cron secret header OR admin session
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    // If no CRON_SECRET configured, allow through (development mode)

    const settings = await prisma.reminderSetting.findFirst();

    // Define 24-hour window from now
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get all cases with hearings in the next 24 hours (non-closed)
    const upcomingCases = await prisma.case.findMany({
      where: {
        nextHearing: { gte: now, lte: in24Hours },
        status: { not: 'CLOSED' },
      },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        junior: { select: { id: true, name: true, phone: true } },
        hearingReminders: {
          where: {
            status: ReminderStatus.SENT,
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
          select: { recipientId: true },
        },
      },
    });

    console.log(`[Cron] Found ${upcomingCases.length} upcoming cases within 24 hours.`);

    const summary: { caseId: string; caseNumber: string; sent: number; skipped: number; failed: number }[] = [];

    for (const caseRecord of upcomingCases) {
      const alreadySentTo = new Set(caseRecord.hearingReminders.map((r) => r.recipientId));

      const hearingDate = caseRecord.nextHearing
        ? new Date(caseRecord.nextHearing).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : 'TBD';

      // Determine template: morning_of if hearing is today, else day_before
      const hearingDay = caseRecord.nextHearing ? new Date(caseRecord.nextHearing).toDateString() : null;
      const templateType: 'day_before' | 'morning_of' =
        hearingDay === now.toDateString() ? 'morning_of' : 'day_before';

      const message = buildSmsMessage(
        templateType,
        caseRecord.caseNumber,
        caseRecord.title,
        caseRecord.court,
        hearingDate,
        settings?.customMessage
      );

      let sent = 0;
      let skipped = 0;
      let failed = 0;

      // ── Client ──
      if (alreadySentTo.has(caseRecord.client.id)) {
        skipped++;
      } else if (!caseRecord.client.phone) {
        console.log(`[Cron] Skipping client ${caseRecord.client.name} — no phone number.`);
        skipped++;
      } else {
        let success = false;
        try {
          success = await sendSms(caseRecord.client.phone, message);
        } catch (err) {
          console.error(`[Cron] Failed to SMS client ${caseRecord.client.name}:`, err);
        }

        await prisma.hearingReminder.create({
          data: {
            caseId: caseRecord.id,
            recipientId: caseRecord.client.id,
            recipientType: 'CLIENT',
            message,
            status: success ? ReminderStatus.SENT : ReminderStatus.FAILED,
            sentAt: success ? new Date() : null,
            scheduledFor: caseRecord.nextHearing,
          },
        });

        success ? sent++ : failed++;
      }

      // ── Junior (if assigned) ──
      if (caseRecord.junior) {
        if (alreadySentTo.has(caseRecord.junior.id)) {
          skipped++;
        } else if (!caseRecord.junior.phone) {
          console.log(`[Cron] Skipping junior ${caseRecord.junior.name} — no phone number.`);
          skipped++;
        } else {
          let success = false;
          try {
            success = await sendSms(caseRecord.junior.phone, message);
          } catch (err) {
            console.error(`[Cron] Failed to SMS junior ${caseRecord.junior.name}:`, err);
          }

          await prisma.hearingReminder.create({
            data: {
              caseId: caseRecord.id,
              recipientId: caseRecord.junior.id,
              recipientType: 'JUNIOR',
              message,
              status: success ? ReminderStatus.SENT : ReminderStatus.FAILED,
              sentAt: success ? new Date() : null,
              scheduledFor: caseRecord.nextHearing,
            },
          });

          success ? sent++ : failed++;
        }
      }

      summary.push({ caseId: caseRecord.id, caseNumber: caseRecord.caseNumber, sent, skipped, failed });
    }

    return NextResponse.json({
      success: true,
      processedCases: upcomingCases.length,
      summary,
    });
  } catch (error: any) {
    console.error('[send-upcoming Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/reminders/history/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// ─── GET /api/reminders/history ──────────────────────────────────────────────
// Returns all HearingReminder records, joined with case and recipient details.
// Admin only.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const reminders = await prisma.hearingReminder.findMany({
      include: {
        case: {
          select: { caseNumber: true, title: true, court: true, nextHearing: true },
        },
        recipient: {
          select: { name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(reminders);
  } catch (error: any) {
    console.error('[Reminders History Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/cron/senior-morning/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Senior Morning Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK 8:00 AM Senior Morning Digest] To: ${to} | Body: "${body}"`);
  return false;
}

export async function GET() {
  return handleSeniorMorning();
}

export async function POST() {
  return handleSeniorMorning();
}

async function handleSeniorMorning() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const seniors = await prisma.user.findMany({
      where: { role: 'SENIOR' },
      select: { id: true, name: true, phone: true },
    });

    const results = [];

    for (const senior of seniors) {
      const ownHearings = await prisma.case.findMany({
        where: {
          seniorId: senior.id,
          nextHearing: { gte: startOfDay, lte: endOfDay },
        },
        select: { caseNumber: true, court: true },
      });

      const pendingDraftsCount = await prisma.draft.count({ where: { status: 'UNDER_REVIEW' } });
      const openEscalationsCount = await prisma.escalation.count({ where: { status: 'OPEN' } });

      const digestText = `Good morning Advocate ${senior.name}. Today: ${ownHearings.length} hearing(s), ${pendingDraftsCount} junior review item(s), ${openEscalationsCount} open escalation(s). Open Senior Workspace: /senior/dashboard - MLR ASSOCIATES`;

      let sent = false;
      if (senior.phone) {
        sent = await sendTwilioMessage(senior.phone, digestText);
      }

      results.push({ senior: senior.name, hearings: ownHearings.length, pendingDraftsCount, openEscalationsCount, sent });
    }

    return NextResponse.json({ success: true, timestamp: now.toISOString(), results });
  } catch (error: any) {
    console.error('[Senior Morning Digest Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/cron/morning-digest/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Morning Digest Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK 8:00 AM Morning Digest] To: ${to} | Body: "${body}"`);
  return false;
}

export async function GET() {
  return handleMorningDigest();
}

export async function POST() {
  return handleMorningDigest();
}

async function handleMorningDigest() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch all Junior Advocates & Interns
    const juniors = await prisma.user.findMany({
      where: { role: { in: ['JUNIOR', 'INTERN'] } },
      select: { id: true, name: true, phone: true },
    });

    const results = [];

    for (const junior of juniors) {
      // Today's hearings assigned to junior
      const todaysHearings = await prisma.case.findMany({
        where: {
          assignedTo: junior.id,
          nextHearing: { gte: startOfDay, lte: endOfDay },
        },
        select: { caseNumber: true, court: true },
      });

      // Today's tasks assigned to junior
      const todaysTasks = await prisma.task.findMany({
        where: {
          assignedTo: junior.id,
          status: { not: 'DONE' },
          deadline: { gte: startOfDay, lte: endOfDay },
        },
        select: { title: true, priority: true },
      });

      const hearingSummary = todaysHearings.length > 0
        ? todaysHearings.map(h => `${h.court}: Case ${h.caseNumber}`).join(', ')
        : 'None';

      const digestText = `Good morning ${junior.name}. You have ${todaysHearings.length} hearing(s) today [${hearingSummary}]. Tasks due today: ${todaysTasks.length}. Open workspace: /junior/dashboard - MLR ASSOCIATES`;

      let sent = false;
      if (junior.phone) {
        sent = await sendTwilioMessage(junior.phone, digestText);
      }

      results.push({ junior: junior.name, hearings: todaysHearings.length, tasks: todaysTasks.length, sent });
    }

    return NextResponse.json({ success: true, timestamp: now.toISOString(), results });
  } catch (error: any) {
    console.error('[Morning Digest Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/cron/log-reminder/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Log Reminder Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK 7:00 PM Log Reminder] To: ${to} | Body: "${body}"`);
  return false;
}

export async function GET() {
  return handleLogReminder();
}

export async function POST() {
  return handleLogReminder();
}

async function handleLogReminder() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch all Junior Advocates & Interns
    const juniors = await prisma.user.findMany({
      where: { role: { in: ['JUNIOR', 'INTERN'] } },
      select: { id: true, name: true, phone: true },
    });

    const results = [];

    for (const junior of juniors) {
      // Check if daily log already submitted today
      const existingLog = await prisma.dailyLog.findFirst({
        where: {
          juniorId: junior.id,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (!existingLog) {
        const smsText = `Reminder: Hi ${junior.name}, please submit your daily work log before 9 PM today at /junior/log. - MLR ASSOCIATES`;
        let sent = false;
        if (junior.phone) {
          sent = await sendTwilioMessage(junior.phone, smsText);
        }
        results.push({ junior: junior.name, status: 'REMINDED', sent });
      } else {
        results.push({ junior: junior.name, status: 'ALREADY_SUBMITTED', sent: false });
      }
    }

    return NextResponse.json({ success: true, timestamp: now.toISOString(), results });
  } catch (error: any) {
    console.error('[Log Reminder Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/cron/checklist-remind/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

async function sendTwilioMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    try {
      const client = twilio(accountSid, authToken);
      await client.messages.create({ body, from: twilioPhone, to });
      return true;
    } catch (err) {
      console.error('[Twilio Checklist Reminder Error]', err);
      return false;
    }
  }

  console.log(`[Twilio MOCK 6:00 PM Checklist Reminder] To: ${to} | Body: "${body}"`);
  return false;
}

export async function GET() {
  return handleChecklistReminder();
}

export async function POST() {
  return handleChecklistReminder();
}

async function handleChecklistReminder() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);

    const upcomingChecklists = await prisma.hearingChecklist.findMany({
      where: {
        completionPct: { lt: 100 },
        case: {
          nextHearing: { gte: startOfTomorrow, lte: endOfTomorrow },
        },
      },
      include: {
        senior: { select: { name: true, phone: true } },
        case: { select: { caseNumber: true } },
      },
    });

    const results = [];
    for (const chk of upcomingChecklists) {
      if (chk.senior && chk.senior.phone) {
        const msg = `Reminder: Tomorrow's hearing checklist for Case ${chk.case?.caseNumber} is ${chk.completionPct}% complete. Update here: /senior/checklist - MLR ASSOCIATES`;
        const sent = await sendTwilioMessage(chk.senior.phone, msg);
        results.push({ senior: chk.senior.name, caseNumber: chk.case?.caseNumber, completionPct: chk.completionPct, sent });
      }
    }

    return NextResponse.json({ success: true, count: upcomingChecklists.length, results });
  } catch (error: any) {
    console.error('[Checklist Reminder Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### File: `src/app/api/cron/weekly-summary/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return handleWeeklySummary();
}

export async function POST() {
  return handleWeeklySummary();
}

async function handleWeeklySummary() {
  try {
    const seniors = await prisma.user.findMany({
      where: { role: 'SENIOR' },
      select: { id: true, name: true, email: true },
    });

    const results = [];
    for (const senior of seniors) {
      const casesCount = await prisma.case.count({ where: { seniorId: senior.id, status: 'ACTIVE' } });
      const outcomesCount = await prisma.caseOutcome.count({ where: { seniorId: senior.id } });

      console.log(`[Weekly Summary Digest MOCK Email] To: ${senior.email} | Senior: ${senior.name} | Active Cases: ${casesCount} | Outcomes: ${outcomesCount}`);
      results.push({ senior: senior.name, activeCases: casesCount, outcomesCount });
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results });
  } catch (error: any) {
    console.error('[Weekly Summary Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
```

---

