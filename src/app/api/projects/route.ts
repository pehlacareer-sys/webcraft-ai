// Projects API
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where = userId ? { userId } : {};

    const projects = await db.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, code, figmaJson, template } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await db.project.create({
      data: {
        userId: userId || 'guest',
        name,
        description,
        code,
        figmaJson,
        template,
        status: 'draft'
      }
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, code, status, vercelDeploymentId, vercelUrl } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (code !== undefined) updateData.code = code;
    if (status !== undefined) updateData.status = status;
    if (vercelDeploymentId !== undefined) updateData.vercelDeploymentId = vercelDeploymentId;
    if (vercelUrl !== undefined) updateData.vercelUrl = vercelUrl;

    const project = await db.project.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Delete associated sessions first
    await db.session.deleteMany({ where: { projectId: id } });
    
    // Delete project
    await db.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
