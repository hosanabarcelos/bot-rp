import {
  Box,
  Button,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Textarea,
  Image,
  VStack,
  useToast,
} from '@chakra-ui/react';
import type { ActionFunction } from '@remix-run/node';
import { Form, useActionData, useTransition } from '@remix-run/react';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import logoImage from '../assets/logo.png';

export const action: ActionFunction = async ({request}) => {
    const formData = await request.formData();

    const url = process.env.WEBHOOK_URL;

    if (!url) {
        return {
            error: true,
            code: 'WEBHOOK_URL is missing',
            message: 'Ocorreu um erro inesperado. Tente novamente.',
        }
    }

    const sender = {
        org: formData.get("org"),
        name: formData.get("name"),
        id: formData.get("id"),
        phone: formData.get("phone"),
    }
    console.log(sender);

    if(!sender?.org || !sender?.name || !sender?.id || !sender?.phone) {
        return {
            error: true,
            message: 'Ocorreu um erro inesperado ao enviar seus dados. Tente novamente!'
        }
    }

    const messageData = {
        embeds: [
            {
                title: "Novo Registro",
                color: 10181046,
                thumbnail: {
                    url: "https://i.imgur.com/hP8Io2F.gif"
                },
                fields: [
                    {
                        name: "Organização",
                        value: sender.org
                    },
                    {
                        name: "Nome",
                        value: sender.name
                    },
                    {
                        name: "ID",
                        value: sender.id
                    },
                    {
                        name: "Celular",
                        value: sender.phone
                    },
                ]
            }
        ]
    }

    try {
        await axios.post(url, messageData)
    } catch (err) {
        return {
            error: true,
            message: 'Ocorreu um erro inesperado. Tente novamente.',
        }
    }

    return {
        ok: true,
    }
}

export default function Contact() {
    const actionData = useActionData();
    const toast = useToast();

    const formRef = useRef<HTMLFormElement>(null);
    
    const transition = useTransition();
    const isSending = transition.state === "submitting" && transition.submission?.formData.get("_action") === 'send';

    useEffect(() => {
        if(!isSending) {
            formRef.current?.reset();
        }
    });

    useEffect(() => {
        if(actionData?.error) {
            toast ({
                title: 'Ops...',
                description: actionData?.message,
                status: 'error',
                position: 'top-right',
            });
        }
        if(actionData?.ok) {
            toast ({
                title: 'Tudo certo!',
                description: 'Logo iremos cadastrar você no nosso sistema, para fazer parte do Bahamas.',
                status: 'success',
                position: 'top-right',
            });
        }
    }, [actionData]);

  return (
    <Flex
      w="100%"
      h="100%"
      bg='#171717'
      align="center"
      justify="center">
      <Box
        w="500px"
        bg='#540157'
        borderRadius="lg"
        p={6}
        color='#FFF'
        shadow="base">
            <Flex mb={8} borderRadius="lg" justify="center" >
                <Image mr={3} mb={5} boxSize='60px' src={logoImage} />
                <Text  as='b' mt={2} fontSize='3xl'>FAMÍLIA BAHAMAS</Text>
            </Flex>
        <Form ref={formRef} method="post">
            <VStack spacing={5}>
            <FormControl isRequired>
                <FormLabel>Organização</FormLabel>
                <Input type="text" name="org" placeholder="Digite Bahamas" />
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Nome</FormLabel>
                <Input type="text" name="name" placeholder="Digite o nome do seu personagem" />
            </FormControl>

            <FormControl isRequired>
                <FormLabel>ID</FormLabel>
                <Input
                    type="number"
                    name="id"
                    placeholder="Digite seu ID do jogo"
                />
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Celular</FormLabel>
                <Input
                name="phone"
                type="text"
                placeholder="Digite o número de celular do seu personagem"
                />
            </FormControl>
            <Button bg='#000000' w="full" name="_action" type="submit">
                Entrar no Bahamas
            </Button>
            </VStack>
        </Form>
      </Box>
    </Flex>
  );
}