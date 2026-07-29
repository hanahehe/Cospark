package com.cospark.service;

import com.cospark.domain.entity.Profile;
import com.cospark.domain.entity.User;
import com.cospark.domain.enums.Availability;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class MatchServiceTest {

    @Test
    void sharedSkillsIncreaseScore() {
        Profile me = Profile.builder()
                .skills(Set.of("React", "TypeScript", "Node.js"))
                .interests(Set.of("SaaS"))
                .availability(Availability.FULL_TIME)
                .build();
        Profile them = Profile.builder()
                .skills(Set.of("React", "Python"))
                .interests(Set.of("SaaS", "AI"))
                .availability(Availability.FULL_TIME)
                .build();

        long shared = me.getSkills().stream().filter(them.getSkills()::contains).count();
        assertEquals(1, shared);
        assertTrue(me.getInterests().stream().anyMatch(them.getInterests()::contains));
    }
}
