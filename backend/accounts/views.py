from django.shortcuts import render
from django.http import HttpResponse

def login_view(request):
    return HttpResponse("Página de Login em construção!")


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Assinatura, Pagamento, Empresa, Plano

class ProcessarPagamentoView(APIView):
    def post(self, request, *args, **kwargs):     
        empresa_id = request.data.get('empresa_id')
        plano_id = request.data.get('plano_id')
        metodo_pagamento = request.data.get('metodo')
        
        try:
            empresa = Empresa.objects.get(id_empresa=empresa_id)
            plano = Plano.objects.get(id_plano=plano_id)
            
            assinatura, created = Assinatura.objects.update_or_create(
                empresa=empresa,
                defaults={
                    'plano': plano,
                    'status': 'ativa'
                }
            )

            Pagamento.objects.create(
                assinatura=assinatura,
                valor=plano.preco_mensal,
                metodo=metodo_pagamento
            )
            
            return Response({"message": "Pagamento confirmado com sucesso! Acesso liberado."}, status=status.HTTP_200_OK)

        except (Empresa.DoesNotExist, Plano.DoesNotExist):
            return Response({"error": "Empresa ou Plano não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)