import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_ROLES } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos desde el decorador @Roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(META_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no pide roles, dejamos pasar a todos
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario desde la petición (lo puso el JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // 3. Verificar si el usuario tiene el rol necesario
    // user.rol viene del payload de tu JWT
    return requiredRoles.includes(user.rol);
  }
}