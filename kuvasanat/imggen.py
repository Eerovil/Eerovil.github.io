import requests
import json
import base64
import os

# Get the API key from the environment
API_KEY = os.environ["OPENAI_API_KEY"]

# Get a prompt from the user
print("Piirretään kuva!")
# prompt = input("Anna sana: ")

# words: [
#     "koira",
#     "kissa",
#     "talo",
#     "auto",
# ],
# wordList: (
#     "hiihtää luistella ratsastaa uida laastari silmälasit oranssi keltainen ratikka moottoripyörä kirkko meri peruna " +
#     "saippua saippuakupla " + 
#     "jogurtti täytekakku sipuli " +
#     "hamsteri lammas kana kukko " + 
#     "marsu undulaatti tipu ankka hanhi " +
#     "akvaario lehmä hevonen kalkkuna varis harakka " +
#     "poni sika vuohi talitiainen pöllö " +
#     "sorsa papukaija muurahainen ilves jänis susi hämähäkki heinäsirkka hyttynen kettu karhu hirvi " +
#     "sudenkorento ampiainen mato poro leijona tiikeri " +
#     "sammakko käärme lisko leopardi kirahvi sarvikuono virtahepo elefantti apina villasukat " +
#     "tossut hellehattu lippalakki sukat paita housut kengät sateenvarjo pipo lapaset tietokone hylly matto verhot kännykkä kamera ovi ikkuna seinä pöytä sohva nojatuoli lattia katto lamppu kaappi lipasto peitto tyyny pallo nukke kynä paperi teroitin päärynä omena hampurilainen makkara lasi muki voi juusto haarukka veitsi lusikka ketsuppi sinappi"
# ),

wordlist = [
    "hiihtää", "luistella", "ratsastaa", "uida", "laastari", "silmälasit", "oranssi", "keltainen", "ratikka", "moottoripyörä", "kirkko", "meri", "peruna",
    "saippua", "saippuakupla", "jogurtti", "täytekakku", "sipuli", "hamsteri", "lammas", "kana", "kukko",
    "marsu", "undulaatti", "tipu", "ankka", "hanhi",
    "akvaario", "lehmä", "hevonen", "kalkkuna", "varis", "harakka",
    "poni", "sika", "vuohi", "talitiainen", "pöllö",
    "sorsa", "papukaija", "muurahainen", "ilves", "jänis", "susi", "hämähäkki", "heinäsirkka", "hyttynen", "kettu", "karhu", "hirvi",
    # Add more words here
    "koira", "kissa", "talo", "auto",
    "sudenkorento", "ampiainen", "mato", "poro", "leijona", "tiikeri",
    "sammakko", "käärme", "lisko", "leopardi", "kirahvi", "sarvikuono", "virtahepo", "elefantti", "apina", "villasukat",
    "tossut", "hellehattu", "lippalakki", "sukat", "paita", "housut", "kengät", "sateenvarjo", "pipo", "lapaset", "tietokone", "hylly", "matto", "verhot", "kännykkä", "kamera", "ovi", "ikkuna", "seinä", "pöytä", "sohva", "nojatuoli", "lattia", "katto", "lamppu", "kaappi", "lipasto", "peitto", "tyyny", "pallo", "nukke", "kynä", "paperi", "teroitin", "päärynä", "omena", "hampurilainen", "makkara", "lasi", "muki", "voi", "juusto", "haarukka", "veitsi", "lusikka", "ketsuppi", "sinappi"
]

# Sort list by word length
wordlist.sort(key=len)

for word in wordlist:
    file_exists = os.path.isfile(f"imgs/{word}.png")
    if not file_exists:
        prompt = word
    else:
        print(f"Kuva sanalle {word} on jo olemassa, ohitetaan.")
        continue

    # Make a request to the GPT-3 API to generate a stable diffusion prompt
    while True:
        try:
            gpt3_response = requests.post("https://api.openai.com/v1/chat/completions", 
                data=json.dumps({
                    "model": "gpt-3.5-turbo-1106",
                    "messages": [
                        {
                            "role": "user",
                            "content": (
                                "You are a prompt generator bot. "
                                "I will provide a word and you will generate a image generation prompt in english for me. "
                                "The image is for a stock photo. "
                                "Always assume that animals are not food, but alive instead. "
                                "Make sure that the requested thing is easily visible in the result. "
                                "Example 'A herd zebra (seepra) grazing in the African savannah, with a focus on its striking black and white stripes, set against a backdrop of tall grass and acacia trees.' "
                                "Only answer with the result. "
                                "If the word is a color, just generate a image of that color (no objects). "
                                "If the word is an action, generate a image of a person doing that action. "
                                "Try to only draw a single object or thing requested (not a group). "
                                "The image can be a photo or a drawing. "
                                "Note: my requests are in finnish. "
                                "Answer YES if you understand."
                            )
                        },
                        {
                            "role": "system",
                            "content": "YES",
                        },
                        {
                            "role": "user",
                            "content": f"{prompt}",
                        }
                    ]
                }),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {API_KEY}"
                },
                timeout=5
            )
            break
        except requests.exceptions.Timeout:
            print("GPT-3 API timeout, trying again...")
            continue

    # Extract the generated stable diffusion prompt from the API response
    try:
        stable_diffusion_prompt = gpt3_response.json()['choices'][-1]['message']['content']
    except Exception:
        print("GPT-3 API error: ", gpt3_response.json())
        raise

    # stable_diffusion_prompt = "A fluffy tabby cat basking in the sunlight, with a playful expression and a paw raised in mid-swat, set against a backdrop of colorful autumn leaves."

    print(f"Generaattorin syöte: {stable_diffusion_prompt}")
    print("Generoidaan kuva...")
    # Url encode the prompt using urllib

    # Make a request to the txt2img API on localhost:7860
    txt2img_response = requests.post(
        f"http://localhost:7860/sdapi/v1/txt2img",
        data=json.dumps({
            "prompt": stable_diffusion_prompt,
            "width": 512,
            "height": 512,
            "seed": 0,
            "batch_size": 1,
        }),
    )

    # Save the generated image to a file
    image_data = base64.b64decode(txt2img_response.json()["images"][0])
    with open(f"imgs/{prompt}.png", "wb") as image_file:
        image_file.write(image_data)

    print(f"Kuva tallennettu tiedostoon {prompt}.png!")
