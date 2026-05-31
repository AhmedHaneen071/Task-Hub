IF DB_ID(N'MarijTaskHubDb') IS NULL
BEGIN
    CREATE DATABASE MarijTaskHubDb;
END;
GO

USE MarijTaskHubDb;
GO

IF OBJECT_ID(N'dbo.ActivityLogs', N'U') IS NOT NULL DROP TABLE dbo.ActivityLogs;
IF OBJECT_ID(N'dbo.TaskComments', N'U') IS NOT NULL DROP TABLE dbo.TaskComments;
IF OBJECT_ID(N'dbo.ProjectTasks', N'U') IS NOT NULL DROP TABLE dbo.ProjectTasks;
IF OBJECT_ID(N'dbo.Projects', N'U') IS NOT NULL DROP TABLE dbo.Projects;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID(N'dbo.AppUsers', N'U') IS NOT NULL DROP TABLE dbo.AppUsers;
GO

CREATE TABLE dbo.AppUsers
(
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AppUsers PRIMARY KEY,
    FullName NVARCHAR(120) NOT NULL,
    Email NVARCHAR(180) NOT NULL,
    PasswordHash NVARCHAR(300) NOT NULL,
    Role NVARCHAR(30) NOT NULL CONSTRAINT DF_AppUsers_Role DEFAULT N'User',
    AvatarUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_AppUsers_IsActive DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_AppUsers_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_AppUsers_Email UNIQUE (Email),
    CONSTRAINT CK_AppUsers_Role CHECK (Role IN (N'Admin', N'User'))
);
GO

CREATE TABLE dbo.Categories
(
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Categories PRIMARY KEY,
    Name NVARCHAR(80) NOT NULL,
    Color NVARCHAR(20) NOT NULL,
    Description NVARCHAR(300) NULL
);
GO

CREATE TABLE dbo.Projects
(
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Projects PRIMARY KEY,
    Name NVARCHAR(140) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    Status NVARCHAR(30) NOT NULL,
    Priority NVARCHAR(30) NOT NULL,
    DueDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Projects_CreatedAt DEFAULT SYSUTCDATETIME(),
    OwnerId INT NOT NULL,
    CategoryId INT NOT NULL,
    CONSTRAINT FK_Projects_AppUsers_OwnerId FOREIGN KEY (OwnerId) REFERENCES dbo.AppUsers(Id),
    CONSTRAINT FK_Projects_Categories_CategoryId FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id),
    CONSTRAINT CK_Projects_Status CHECK (Status IN (N'Planning', N'Active', N'Blocked', N'Completed')),
    CONSTRAINT CK_Projects_Priority CHECK (Priority IN (N'Low', N'Medium', N'High', N'Critical'))
);
GO

CREATE TABLE dbo.ProjectTasks
(
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProjectTasks PRIMARY KEY,
    Title NVARCHAR(160) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    Status NVARCHAR(30) NOT NULL,
    DueDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ProjectTasks_CreatedAt DEFAULT SYSUTCDATETIME(),
    ProjectId INT NOT NULL,
    AssigneeId INT NULL,
    CONSTRAINT FK_ProjectTasks_Projects_ProjectId FOREIGN KEY (ProjectId) REFERENCES dbo.Projects(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProjectTasks_AppUsers_AssigneeId FOREIGN KEY (AssigneeId) REFERENCES dbo.AppUsers(Id) ON DELETE SET NULL,
    CONSTRAINT CK_ProjectTasks_Status CHECK (Status IN (N'ToDo', N'InProgress', N'Review', N'Done'))
);
GO

CREATE TABLE dbo.TaskComments
(
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TaskComments PRIMARY KEY,
    Message NVARCHAR(1200) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_TaskComments_CreatedAt DEFAULT SYSUTCDATETIME(),
    TaskId INT NOT NULL,
    AuthorId INT NOT NULL,
    CONSTRAINT FK_TaskComments_ProjectTasks_TaskId FOREIGN KEY (TaskId) REFERENCES dbo.ProjectTasks(Id) ON DELETE CASCADE,
    CONSTRAINT FK_TaskComments_AppUsers_AuthorId FOREIGN KEY (AuthorId) REFERENCES dbo.AppUsers(Id)
);
GO

CREATE TABLE dbo.ActivityLogs
(
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ActivityLogs PRIMARY KEY,
    Message NVARCHAR(500) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_ActivityLogs_CreatedAt DEFAULT SYSUTCDATETIME(),
    ProjectId INT NOT NULL,
    UserId INT NOT NULL,
    CONSTRAINT FK_ActivityLogs_Projects_ProjectId FOREIGN KEY (ProjectId) REFERENCES dbo.Projects(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ActivityLogs_AppUsers_UserId FOREIGN KEY (UserId) REFERENCES dbo.AppUsers(Id)
);
GO

CREATE INDEX IX_Projects_OwnerId ON dbo.Projects(OwnerId);
CREATE INDEX IX_Projects_CategoryId ON dbo.Projects(CategoryId);
CREATE INDEX IX_ProjectTasks_ProjectId ON dbo.ProjectTasks(ProjectId);
CREATE INDEX IX_ProjectTasks_AssigneeId ON dbo.ProjectTasks(AssigneeId);
CREATE INDEX IX_TaskComments_TaskId ON dbo.TaskComments(TaskId);
CREATE INDEX IX_ActivityLogs_ProjectId ON dbo.ActivityLogs(ProjectId);
GO
