from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import get_chatbot_response

import traceback
import logging

logger = logging.getLogger(__name__)

class ChatbotView(APIView):
    def get(self, request):
        return Response({
            'message': 'Chatbot endpoint is active. Use POST to chat.',
            'example_payload': {
                'message': 'Hello',
                'history': []
            }
        }, status=status.HTTP_200_OK)

    def post(self, request):
        user_input = request.data.get('message')
        history = request.data.get('history', [])
        user_id = request.data.get('user_id')
        is_recommendation = request.data.get('recommendation', False)

        if not user_input and not is_recommendation:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # If it's a recommendation button click, we use a default prompt
        if is_recommendation and not user_input:
            user_input = "Please provide some stock recommendations for me."

        try:
            bot_response = get_chatbot_response(user_input, history, user_id, is_recommendation)
            return Response({'response': bot_response}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Chatbot Error: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                'error': str(e),
                'details': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
