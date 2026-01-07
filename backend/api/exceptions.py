from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Manejador personalizado de excepciones para API.
    Asegura respuestas consistentes y seguras.
    """
    # Primero obtener la respuesta estándar
    response = exception_handler(exc, context)
    
    if response is not None:
        # Personalizar el formato de respuesta
        custom_response = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': get_error_message(response.data),
            }
        }
        response.data = custom_response
    else:
        # Error no manejado - log y respuesta genérica
        logger.exception(f"Unhandled exception: {exc}")
        response = Response(
            {
                'success': False,
                'error': {
                    'code': 500,
                    'message': 'Error interno del servidor'
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response


def get_error_message(data):
    """Extrae mensaje de error legible de los datos de respuesta."""
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        # Errores de validación
        messages = []
        for field, errors in data.items():
            if isinstance(errors, list):
                messages.append(f"{field}: {', '.join(str(e) for e in errors)}")
            else:
                messages.append(f"{field}: {errors}")
        return '; '.join(messages) if messages else 'Error de validación'
    elif isinstance(data, list):
        return '; '.join(str(item) for item in data)
    return str(data)
