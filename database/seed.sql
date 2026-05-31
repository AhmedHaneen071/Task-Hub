USE MarijTaskHubDb;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.AppUsers WHERE Email = N'admin@taskhub.local')
BEGIN
    SET IDENTITY_INSERT dbo.AppUsers ON;
    INSERT INTO dbo.AppUsers (Id, FullName, Email, PasswordHash, Role, AvatarUrl, IsActive, CreatedAt)
    VALUES
        (1, N'Admin User', N'admin@taskhub.local', N'pbkdf2:100000:VGFza0h1YkFkbWluU2FsdA==:yPnxF7duVO3qazFy5nOB7qJ2T/pMZxg3ojhbzmdFuI8=', N'Admin', N'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80', 1, '2026-05-01T09:00:00'),
        (2, N'Maya Khan', N'maya@taskhub.local', N'pbkdf2:100000:VGFza0h1YlVzZXJTYWx0MQ==:5TrIiubl8k11v+mPhqZf6FLKIILyQ5SQ0shs2EMQpk4=', N'User', N'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&q=80', 1, '2026-05-03T10:30:00'),
        (3, N'Alex Reed', N'alex@taskhub.local', N'pbkdf2:100000:VGFza0h1YlVzZXJTYWx0Mg==:5y0WKzqYppFNf2XuLx0c6eH645H4uzWtikK0gDPMLhY=', N'User', N'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80', 1, '2026-05-05T13:15:00');
    SET IDENTITY_INSERT dbo.AppUsers OFF;
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Categories)
BEGIN
    SET IDENTITY_INSERT dbo.Categories ON;
    INSERT INTO dbo.Categories (Id, Name, Color, Description)
    VALUES
        (1, N'Product', N'#2563eb', N'Customer-facing product work'),
        (2, N'Operations', N'#16a34a', N'Internal process and delivery work'),
        (3, N'Research', N'#f97316', N'Discovery, analysis, and validation');
    SET IDENTITY_INSERT dbo.Categories OFF;
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Projects)
BEGIN
    SET IDENTITY_INSERT dbo.Projects ON;
    INSERT INTO dbo.Projects (Id, Name, Description, Status, Priority, DueDate, CreatedAt, OwnerId, CategoryId)
    VALUES
        (1, N'Client Portal Refresh', N'Modernize the customer portal with faster task tracking and searchable activity history.', N'Active', N'High', '2026-06-30T18:00:00', '2026-05-10T09:00:00', 2, 1),
        (2, N'Partner Onboarding Playbook', N'Build a repeatable onboarding workflow with document checks, approvals, and handoff notes.', N'Planning', N'Medium', '2026-07-15T18:00:00', '2026-05-12T11:00:00', 3, 2);
    SET IDENTITY_INSERT dbo.Projects OFF;
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.ProjectTasks)
BEGIN
    SET IDENTITY_INSERT dbo.ProjectTasks ON;
    INSERT INTO dbo.ProjectTasks (Id, Title, Description, Status, DueDate, CreatedAt, ProjectId, AssigneeId)
    VALUES
        (1, N'Ship dashboard API', N'Expose project counts, open tasks, and recent activity for the Angular dashboard.', N'InProgress', '2026-06-07T18:00:00', '2026-05-14T09:00:00', 1, 2),
        (2, N'Design activity filters', N'Create searchable filters for project events and task discussions.', N'Review', '2026-06-10T18:00:00', '2026-05-15T10:00:00', 1, 3),
        (3, N'Draft kickoff checklist', N'Create a standard checklist for every new partner implementation.', N'ToDo', '2026-06-12T18:00:00', '2026-05-16T11:00:00', 2, 3);
    SET IDENTITY_INSERT dbo.ProjectTasks OFF;
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.TaskComments)
BEGIN
    SET IDENTITY_INSERT dbo.TaskComments ON;
    INSERT INTO dbo.TaskComments (Id, Message, CreatedAt, TaskId, AuthorId)
    VALUES
        (1, N'Initial endpoint contract is ready for frontend integration.', '2026-05-18T12:00:00', 1, 2),
        (2, N'I added review notes for activity filtering.', '2026-05-19T14:30:00', 2, 3);
    SET IDENTITY_INSERT dbo.TaskComments OFF;
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.ActivityLogs)
BEGIN
    SET IDENTITY_INSERT dbo.ActivityLogs ON;
    INSERT INTO dbo.ActivityLogs (Id, Message, CreatedAt, ProjectId, UserId)
    VALUES
        (1, N'Created project roadmap and assigned first tasks.', '2026-05-10T09:15:00', 1, 2),
        (2, N'Added onboarding milestones for operations review.', '2026-05-12T11:20:00', 2, 3),
        (3, N'Commented on dashboard API implementation.', '2026-05-18T12:00:00', 1, 2);
    SET IDENTITY_INSERT dbo.ActivityLogs OFF;
END;
GO
