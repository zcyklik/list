import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 150" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <h3>{{ level.description }}</h3>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Level ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Song ID</div>
                            <p>{{ level.songID }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <h4 v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</h4>
                    <h4 v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</h4>
                    <h4 v-else>This level does not accept new records.</h4>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`./assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <p><a href="https://zcyklik.github.io" target="_blank">List Editor: cyklik</a></p>
                    <p><a href="https://github.com/zcyklik/list" target="_blank">Github repo</a></p>
                    <p><a href="https://github.com/TheShittyList/GDListTemplate" target="_blank">Website template link</a></p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            if (!this.list || !this.list[this.selected]) {
                return null;
            }
            return this.list[this.selected][0];
        },
        video() {
            if (!this.level || !this.level.verification) {
                return '';
            }
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        try {
            this.list = await fetchList();
            if (!this.list) {
                this.errors = [
                    "Failed to load list. Please check the browser console for more details.",
                ];
            } else {
                this.errors.push(
                    ...this.list
                        .filter(([_, err]) => err)
                        .map(([_, err]) => {
                            return `Failed to load level. (${err}.json)`;
                        })
                );
            }

        } catch (error) {
            console.error('Error in List component:', error);
            this.errors = ["An unexpected error occurred. Please check the browser console for details."];
        } finally {
            this.loading = false;
        }
    },
    methods: {
        embed,
        score,
    },
};
