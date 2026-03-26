from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import get_chatbot_response
from .models import ChatMessage
from django.contrib.auth.models import User

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
        current_portfolio_id = request.data.get('current_portfolio_id')
        current_portfolio_name = request.data.get('current_portfolio_name')
        current_portfolio_type = request.data.get('current_portfolio_type')

        if not user_input and not is_recommendation:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # If it's a recommendation button click, we use a default prompt
        if is_recommendation and not user_input:
            user_input = "Please provide some stock recommendations for me."

        try:
            bot_response = get_chatbot_response(
                user_input,
                history,
                user_id,
                is_recommendation,
                current_portfolio_id=current_portfolio_id,
                current_portfolio_name=current_portfolio_name,
                current_portfolio_type=current_portfolio_type,
            )
        except Exception as e:
            logger.error(f"Chatbot Error: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                'error': str(e),
                'details': traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Saving chat history should not break the actual chat experience.
        try:
            user_obj = None
            if user_id:
                try:
                    user_obj = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    pass

            ChatMessage.objects.create(
                user=user_obj,
                user_message=user_input,
                bot_response=bot_response,
                is_recommendation=is_recommendation
            )
        except Exception as save_error:
            logger.warning(f"Chatbot message save failed: {str(save_error)}")
            logger.warning(traceback.format_exc())

        return Response({'response': bot_response}, status=status.HTTP_200_OK)
