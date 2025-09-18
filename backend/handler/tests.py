from django.test import TestCase
from rest_framework.test import APITestCase
from django.urls import reverse

class TesteAPITestCase(APITestCase):
    def test_get_teste(self):
        url = reverse('teste-api')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('mensagem', response.data)
        self.assertEqual(response.data['status'], 'ok')

    def test_post_teste(self):
        url = reverse('teste-api')
        payload = {'foo': 'bar'}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('recebido', response.data)
        self.assertEqual(response.data['recebido']['foo'], 'bar')
