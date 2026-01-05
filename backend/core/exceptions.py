"""
Custom exception handler for the API.
Ensures no sensitive information is leaked in error responses (OWASP A09).
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that:
    1. Logs the full error for debugging
    2. Returns sanitized error messages to the client
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the error (without sensitive data)
    view = context.get('view', None)
    view_name = view.__class__.__name__ if view else 'Unknown'
    logger.error(f"Exception in {view_name}: {type(exc).__name__}")
    
    if response is not None:
        # Customize the response data
        response.data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': get_user_friendly_message(response.status_code),
                'details': response.data if response.status_code < 500 else None
            }
        }
    else:
        # Handle unexpected exceptions
        logger.exception("Unhandled exception occurred")
        response = Response(
            {
                'success': False,
                'error': {
                    'code': 500,
                    'message': 'Ha ocurrido un error interno. Por favor, intenta más tarde.',
                    'details': None
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response


def get_user_friendly_message(status_code):
    """Return user-friendly error messages in Spanish."""
    messages = {
        400: 'Solicitud inválida. Por favor, verifica los datos enviados.',
        401: 'No autorizado. Por favor, inicia sesión.',
        403: 'Acceso denegado.',
        404: 'Recurso no encontrado.',
        405: 'Método no permitido.',
        429: 'Demasiadas solicitudes. Por favor, espera un momento.',
        500: 'Error interno del servidor.',
        502: 'Error de conexión.',
        503: 'Servicio no disponible temporalmente.',
    }
    return messages.get(status_code, 'Ha ocurrido un error.')
